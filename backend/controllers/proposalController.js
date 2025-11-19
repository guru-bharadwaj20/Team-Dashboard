import Proposal from '../models/Proposal.js';
import Team from '../models/Team.js';

export const createProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const proposal = new Proposal({ teamId, title, description, creator: req.user._id });
    await proposal.save();
    res.status(201).json(proposal);
  } catch (err) {
    console.error('Create proposal error:', err);
    res.status(400).json({ message: err.message || 'Failed to create proposal' });
  }
};

export const getProposalsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const proposals = await Proposal.find({ teamId });
    res.json(proposals);
  } catch (err) {
    console.error('Get proposals error:', err);
    res.status(400).json({ message: err.message || 'Failed to fetch proposals' });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id).populate('creator', 'name email').populate('comments.user', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (err) {
    console.error('Get proposal error:', err);
    res.status(400).json({ message: err.message || 'Failed to fetch proposal' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // proposal id
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.comments.push({ user: req.user._id, text });
    await proposal.save();
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(400).json({ message: err.message || 'Failed to add comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id).populate('comments.user', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal.comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(400).json({ message: err.message || 'Failed to fetch comments' });
  }
};
