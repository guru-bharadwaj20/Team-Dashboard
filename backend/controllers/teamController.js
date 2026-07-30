import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import { emitBroadcast, emitToTeam, emitToUser, SOCKET_EVENTS } from '../utils/socketEvents.js';
import { logActivity } from '../services/activityService.js';

// Legacy aliases used below
const emitGlobalNotification = emitBroadcast;
const emitTeamUpdate = emitToTeam;

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const team = new Team({ name, description, creator: req.user._id, members: [req.user._id] });
    await team.save();
    
    const io = req.app.get('io');
    await logActivity(io, {
      userId: req.user._id, userName: req.user.name,
      action: 'team.created', targetId: team._id,
      targetType: 'team', targetTitle: team.name, teamId: team._id,
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Failed to create team', error: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    // Only teams the caller belongs to — team membership is the privacy boundary.
    const teams = await Team.find({ members: req.user._id })
      .populate('creator', 'name email')
      .populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    // Membership already enforced by requireTeamMember; re-read with population.
    const team = await Team.findById(req.team._id)
      .populate('creator', 'name email')
      .populate('members', 'name email');
    const rawProposals = await Proposal.find({ teamId: team._id });
    const proposals = rawProposals.map((p) => {
      const responses = { agree: 0, disagree: 0, neutral: 0 };
      for (const v of p.votes) {
        if (responses[v.vote] !== undefined) responses[v.vote]++;
      }
      return { ...p.toObject(), responses, totalVotes: p.votes.length };
    });
    res.json({ team, proposals });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Failed to fetch team', error: error.message });
  }
};

/**
 * Join a team using its share code. Joining by raw team id is not offered: it would
 * let anyone enumerate ObjectIds and insert themselves into arbitrary teams.
 */
export const joinTeam = async (req, res) => {
  try {
    const shareId = String(req.body?.shareId || '').trim();
    if (!shareId) return res.status(400).json({ message: 'A team share code is required' });

    const team = await Team.findOne({ shareId });
    if (!team) return res.status(404).json({ message: 'No team found for that share code' });

    const id = team._id.toString();
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
      
      const io = req.app.get('io');
      if (io) {
        emitTeamUpdate(io, id, SOCKET_EVENTS.TEAM_MEMBER_JOINED, {
          teamId: id,
          member: { id: req.user._id, name: req.user.name, email: req.user.email },
          memberCount: team.members.length,
        });
      }
      await logActivity(io, {
        userId: req.user._id, userName: req.user.name,
        action: 'team.member_joined', targetId: team._id,
        targetType: 'team', targetTitle: team.name, teamId: team._id,
      });
    }
    res.json(team);
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ message: 'Failed to join team', error: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    // Creator-only; enforced by requireTeamCreator, which attaches req.team.
    const team = req.team;
    const id = team._id.toString();

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
