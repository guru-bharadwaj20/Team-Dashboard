import { asyncHandler } from '../middleware/asyncHandler.js';
import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';

export const getPublicBoard = asyncHandler(async (req, res) => {
  const { shareId } = req.params;
  const team = await Team.findOne({ shareId }).populate('creator', 'name');
  if (!team) return res.status(404).json({ message: 'Board not found' });

  const proposals = await Proposal.find({ teamId: team._id });

  const publicProposals = proposals.map((p) => {
    const responses = { agree: 0, disagree: 0, neutral: 0 };
    for (const v of p.votes) {
      if (responses[v.vote] !== undefined) responses[v.vote]++;
    }
    return {
      id: p._id,
      title: p.title,
      description: p.description,
      status: p.status,
      responses,
      totalVotes: p.votes.length,
      options: p.options.map((o) => ({ id: o._id, text: o.text })),
      createdAt: p.createdAt,
      deadline: p.deadline,
    };
  });

  res.json({
    team: {
      id: team._id,
      name: team.name,
      description: team.description,
      shareId: team.shareId,
      memberCount: team.members.length,
    },
    proposals: publicProposals,
  });
});
