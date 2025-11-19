import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';

export const getPublicBoard = async (req, res) => {
  try {
    const { shareId } = req.params;
    const team = await Team.findOne({ shareId }).populate('creator', 'name');
    if (!team) return res.status(404).json({ message: 'Board not found' });

    const proposals = await Proposal.find({ teamId: team._id });
    // for each proposal prepare results
    const publicProposals = proposals.map((p) => {
      const counts = p.options.map((opt) => ({ optionId: opt._id, text: opt.text, count: 0 }));
      for (const v of p.votes) {
        const idx = counts.findIndex((c) => c.optionId.toString() === v.optionId.toString());
        if (idx >= 0) counts[idx].count++;
      }
      return {
        id: p._id,
        title: p.title,
        description: p.description,
        results: counts,
        totalVotes: p.votes.length,
        createdAt: p.createdAt,
      };
    });

    res.json({ team: { id: team._id, name: team.name, description: team.description, shareId: team.shareId }, proposals: publicProposals });
  } catch (error) {
    console.error('Error fetching public board:', error);
    res.status(500).json({ message: 'Failed to fetch public board', error: error.message });
  }
};
