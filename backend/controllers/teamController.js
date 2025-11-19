import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import { emitGlobalNotification, emitTeamUpdate, SOCKET_EVENTS } from '../utils/socketEvents.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const team = new Team({ name, description, creator: req.user._id, members: [req.user._id] });
    await team.save();
    
    // No need to emit socket event - the creator gets the response directly
    // Other users will see the new team when they refresh or when the Dashboard fetches teams
    
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Failed to create team', error: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('creator', 'name email').populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
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
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Failed to fetch team', error: error.message });
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
      
      // Create notification for team creator
      if (team.creator.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: team.creator,
          type: 'info',
          title: 'New Team Member',
          message: `${req.user.name} joined your team "${team.name}"`,
          link: `/team/${id}`,
          relatedId: id,
          relatedType: 'team',
        });
        
        // Emit real-time notification to team creator
        const io = req.app.get('io');
        if (io) {
          io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
            userId: team.creator.toString(),
            type: 'info',
            title: 'New Team Member',
            message: `${req.user.name} joined your team "${team.name}"`,
            link: `/team/${id}`,
          });
        }
      }
      
      // Emit socket event for new member
      const io = req.app.get('io');
      if (io) {
        emitTeamUpdate(io, id, SOCKET_EVENTS.TEAM_MEMBER_JOINED, {
          teamId: id,
          member: { id: req.user._id, name: req.user.name, email: req.user.email },
          memberCount: team.members.length,
        });
      }
    }
    res.json(team);
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ message: 'Failed to join team', error: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    // Check if user is the creator or a member (you can add more specific authorization)
    if (!team.creator.equals(req.user._id) && !team.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }
    
    // Delete associated proposals
    await Proposal.deleteMany({ teamId: id });
    
    // Delete the team
    await Team.findByIdAndDelete(id);
    
    // Emit socket event for team deletion
    const io = req.app.get('io');
    if (io) {
      emitGlobalNotification(io, SOCKET_EVENTS.TEAM_DELETED, {
        teamId: id,
        teamName: team.name,
      });
    }
    
    res.json({ message: 'Team and associated proposals deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Failed to delete team', error: error.message });
  }
};
