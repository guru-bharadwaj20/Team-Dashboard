import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';

export const createTeam = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  const team = new Team({ name, description, creator: req.user._id, members: [req.user._id] });
  await team.save();
  res.status(201).json(team);
};

export const getTeams = async (req, res) => {
  const teams = await Team.find().populate('creator', 'name email').populate('members', 'name email');
  res.json(teams);
};

export const getTeamById = async (req, res) => {
  const { id } = req.params;
  const team = await Team.findById(id).populate('creator', 'name email').populate('members', 'name email');
  if (!team) return res.status(404).json({ message: 'Team not found' });
  // include proposals
  const proposals = await Proposal.find({ teamId: team._id });
  res.json({ team, proposals });
};

export const joinTeam = async (req, res) => {
  const { id } = req.params;
  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (!team.members.includes(req.user._id)) {
    team.members.push(req.user._id);
    await team.save();
  }
  res.json(team);
};
