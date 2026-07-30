import Proposal from '../models/Proposal.js';
import { emitToProposal, emitToTeam, SOCKET_EVENTS } from '../utils/socketEvents.js';

/**
 * Deadline enforcement.
 *
 * Deadlines were previously decorative: nothing ever transitioned a proposal out
 * of `open` when its deadline passed, so `closed` was a status no code path could
 * produce. A proposal past its deadline without consensus is now closed, both
 * lazily (when someone touches it) and by a periodic sweep.
 */

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

const announce = (io, proposal) => {
  if (!io) return;
  const payload = {
    proposalId: proposal._id.toString(),
    teamId: proposal.teamId?.toString(),
    status: 'closed',
    closedAt: proposal.closedAt,
    title: proposal.title,
  };
  emitToProposal(io, proposal._id.toString(), SOCKET_EVENTS.PROPOSAL_STATUS_CHANGED, payload);
  if (proposal.teamId) {
    emitToTeam(io, proposal.teamId.toString(), SOCKET_EVENTS.PROPOSAL_STATUS_CHANGED, payload);
  }
};

/**
 * Closes a single proposal if it is open and past its deadline.
 * The update is conditional, so concurrent callers cannot double-close.
 * @returns {Promise<boolean>} whether this call performed the close
 */
export const closeProposalIfExpired = async (proposal, io) => {
  if (!proposal?.deadline || proposal.status !== 'open') return false;
  if (proposal.deadline.getTime() >= Date.now()) return false;

  const closed = await Proposal.findOneAndUpdate(
    { _id: proposal._id, status: 'open' },
    { $set: { status: 'closed', closedAt: new Date() } },
    { new: true }
  );

  if (!closed) return false;
  announce(io, closed);
  return true;
};

/** Closes every open proposal whose deadline has passed. */
export const sweepExpiredProposals = async (io) => {
  const now = new Date();
  const expired = await Proposal.find({
    status: 'open',
    deadline: { $ne: null, $lt: now },
  }).select('_id teamId title');

  if (expired.length === 0) return 0;

  await Proposal.updateMany(
    { _id: { $in: expired.map((p) => p._id) }, status: 'open' },
    { $set: { status: 'closed', closedAt: now } }
  );

  for (const p of expired) {
    announce(io, { ...p.toObject(), closedAt: now });
  }

  console.log(`[Deadline] Closed ${expired.length} expired proposal(s)`);
  return expired.length;
};

/**
 * Starts the periodic sweep. Returns a stop function so shutdown can clear it.
 */
export const startDeadlineSweeper = (io) => {
  const run = () =>
    sweepExpiredProposals(io).catch((err) =>
      console.error('[Deadline] Sweep failed:', err.message)
    );

  const timer = setInterval(run, SWEEP_INTERVAL_MS);
  // Do not hold the event loop open on account of this timer.
  timer.unref?.();
  run();

  return () => clearInterval(timer);
};
