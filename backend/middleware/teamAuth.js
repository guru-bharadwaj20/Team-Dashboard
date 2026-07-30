import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';

/**
 * Team authorization guards.
 *
 * Every team-scoped resource (proposals, votes, comments, exports) is private to
 * the team's members. These guards resolve the team once and attach it to the
 * request so controllers do not have to re-query or re-check.
 */

export const isTeamMember = (team, userId) =>
  team.members.some((m) => m.equals(userId));

const badId = (res) => res.status(400).json({ message: 'Invalid id' });

/**
 * Requires the caller to be a member of the team named by :teamId or :id.
 * Attaches `req.team`.
 */
export const requireTeamMember = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    if (!mongoose.isValidObjectId(teamId)) return badId(res);

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (!isTeamMember(team, req.user._id)) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    req.team = team;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Requires the caller to be the team's creator. Deleting a team cascades to every
 * proposal in it, so membership alone is not sufficient authority.
 * Attaches `req.team`.
 */
export const requireTeamCreator = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    if (!mongoose.isValidObjectId(teamId)) return badId(res);

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (!team.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the team creator can do this' });
    }

    req.team = team;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Resolves the proposal named by :id and requires membership of its parent team.
 * Attaches `req.proposal` and `req.team`.
 */
export const requireProposalMember = async (req, res, next) => {
  try {
    const proposalId = req.params.id;
    if (!mongoose.isValidObjectId(proposalId)) return badId(res);

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const team = await Team.findById(proposal.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (!isTeamMember(team, req.user._id)) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    req.proposal = proposal;
    req.team = team;
    next();
  } catch (err) {
    next(err);
  }
};
