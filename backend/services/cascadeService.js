import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';

/**
 * Referential cleanup.
 *
 * Nothing used to remove the Notifications and Activities that pointed at a
 * deleted proposal or team, so users were left with feed entries and notification
 * links that resolved to 404s, and analytics counted actions on records that no
 * longer existed.
 */

/** Removes notifications and activity rows referencing the given target ids. */
const purgeReferences = async (ids, session) => {
  if (ids.length === 0) return;
  const opts = session ? { session } : {};
  await Promise.all([
    Notification.deleteMany({ relatedId: { $in: ids } }, opts),
    Activity.deleteMany({ targetId: { $in: ids } }, opts),
  ]);
};

/** Cascade for a single deleted proposal. */
export const cascadeProposalDelete = async (proposalId, session) => {
  await purgeReferences([proposalId], session);
};

/** Cascade for a deleted team: its proposals and everything referencing them. */
export const cascadeTeamDelete = async (teamId, session) => {
  const opts = session ? { session } : {};

  const proposals = await Proposal.find({ teamId }).select('_id').session(session || null);
  const proposalIds = proposals.map((p) => p._id);

  await purgeReferences([...proposalIds, teamId], session);
  await Proposal.deleteMany({ teamId }, opts);
  await Activity.deleteMany({ teamId }, opts);
};

/**
 * Everything that must happen when a user deletes their account.
 *
 * Ordering matters: teams the user created are removed with their full cascade,
 * then the user is pulled from remaining teams, then their own proposals
 * elsewhere are removed. Run inside a transaction when the deployment supports
 * one (Atlas and any replica set), so a mid-way failure cannot leave the database
 * half-deleted.
 */
export const cascadeUserDelete = async (userId, session) => {
  const opts = session ? { session } : {};

  const ownedTeams = await Team.find({ creator: userId }).select('_id').session(session || null);
  for (const team of ownedTeams) {
    await cascadeTeamDelete(team._id, session);
  }
  await Team.deleteMany({ creator: userId }, opts);

  // Remove from teams owned by others.
  await Team.updateMany({ members: userId }, { $pull: { members: userId } }, opts);

  // Proposals this user authored in teams they did not own.
  const ownProposals = await Proposal.find({ creator: userId }).select('_id').session(session || null);
  const ownProposalIds = ownProposals.map((p) => p._id);
  await purgeReferences(ownProposalIds, session);
  await Proposal.deleteMany({ creator: userId }, opts);

  // Their votes and comments on proposals that survive.
  await Proposal.updateMany(
    { 'votes.user': userId },
    { $pull: { votes: { user: userId } } },
    opts
  );
  await Proposal.updateMany(
    { 'comments.user': userId },
    { $pull: { comments: { user: userId } } },
    opts
  );

  // Their own notifications, and any addressed to them.
  await Notification.deleteMany({ userId }, opts);
  await Activity.deleteMany({ userId }, opts);
};

/**
 * Runs `work` inside a transaction where the deployment supports one, and
 * directly otherwise (a standalone mongod cannot start transactions).
 */
export const withTransaction = async (work) => {
  let session;
  try {
    session = await mongoose.startSession();
  } catch {
    await work(null);
    return { transactional: false };
  }

  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return { transactional: true, result };
  } catch (err) {
    // Standalone deployments reject transactions outright; fall back rather than
    // failing the user's request.
    const unsupported =
      err?.code === 20 ||
      /Transaction numbers are only allowed|replica set|mongos/i.test(err?.message || '');
    if (!unsupported) throw err;
    await work(null);
    return { transactional: false };
  } finally {
    await session.endSession();
  }
};
