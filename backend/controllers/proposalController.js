import Proposal from '../models/Proposal.js';
import Team from '../models/Team.js';
import mongoose from 'mongoose';

export const createProposal = async (req, res) => {
  const { teamId } = req.params;
  const { title, description, options } = req.body;

  if (!title || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: 'Title and 2-5 options are required' });
  }

  if (options.length > 5) return res.status(400).json({ message: 'A maximum of 5 options is allowed' });

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ message: 'Team not found' });

  const opts = options.map((o) => ({ text: o }));
  const proposal = new Proposal({ teamId, title, description, options: opts, creator: req.user._id });
  await proposal.save();
  res.status(201).json(proposal);
};

export const getProposalsByTeam = async (req, res) => {
  const { teamId } = req.params;
  const proposals = await Proposal.find({ teamId });
  res.json(proposals);
};

export const getProposalById = async (req, res) => {
  const { id } = req.params;
  const proposal = await Proposal.findById(id).populate('creator', 'name email').populate('comments.user', 'name');
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  res.json(proposal);
};

export const vote = async (req, res) => {
  const { id } = req.params; // proposal id
  const { option } = req.body; // option is optionId string or index
  const userId = req.user._id;

  const proposal = await Proposal.findById(id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

  // Resolve optionId
  let optionId = option;
  if (!mongoose.isValidObjectId(option)) {
    // maybe option is index
    const idx = Number(option);
    if (Number.isInteger(idx) && idx >= 0 && idx < proposal.options.length) {
      optionId = proposal.options[idx]._id;
    } else {
      return res.status(400).json({ message: 'Invalid option' });
    }
  }

  // Remove existing vote by user
  proposal.votes = proposal.votes.filter((v) => v.user.toString() !== userId.toString());
  // Add new vote
  proposal.votes.push({ user: userId, optionId });
  await proposal.save();

  res.json({ message: 'Vote recorded' });
};

export const getResults = async (req, res) => {
  const { id } = req.params;
  const proposal = await Proposal.findById(id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

  const counts = proposal.options.map((opt) => ({ optionId: opt._id, text: opt.text, count: 0 }));
  for (const v of proposal.votes) {
    const idx = counts.findIndex((c) => c.optionId.toString() === v.optionId.toString());
    if (idx >= 0) counts[idx].count++;
  }

  res.json({ proposalId: proposal._id, results: counts, totalVotes: proposal.votes.length });
};

export const addComment = async (req, res) => {
  const { id } = req.params; // proposal id
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Text is required' });

  const proposal = await Proposal.findById(id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

  proposal.comments.push({ user: req.user._id, text });
  await proposal.save();
  res.status(201).json({ message: 'Comment added' });
};

export const getComments = async (req, res) => {
  const { id } = req.params;
  const proposal = await Proposal.findById(id).populate('comments.user', 'name email');
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  res.json(proposal.comments);
};
