import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const team = new Team({ name, description, creator: req.user._id, members: [req.user._id] });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    console.error('Create team error:', err);
    res.status(400).json({ message: err.message || 'Failed to create team' });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('creator', 'name email').populate('members', 'name email');
    res.json(teams);
  } catch (err) {
    console.error('Get teams error:', err);
    res.status(400).json({ message: err.message || 'Failed to fetch teams' });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('creator', 'name email').populate('members', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    // include proposals
    const proposals = await Proposal.find({ teamId: team._id });
    res.json({ team, proposals });
  } catch (err) {
    console.error('Get team error:', err);
    res.status(400).json({ message: err.message || 'Failed to fetch team' });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!team.members.includes(req.user._id)) {
      team.members.push(req.user._id);
      await team.save();
    }
    res.json(team);
  } catch (err) {
    console.error('Join team error:', err);
    res.status(400).json({ message: err.message || 'Failed to join team' });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Only creator can delete team
    if (team.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team creator can delete the team' });
    }

    // Delete all proposals associated with this team
    await Proposal.deleteMany({ teamId: id });

    // Delete the team
    await Team.findByIdAndDelete(id);

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Delete team error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete team' });
  }
};
