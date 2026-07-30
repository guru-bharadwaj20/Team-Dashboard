import Team, { generateShareId } from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import { emitToTeam, emitToUser, SOCKET_EVENTS } from '../utils/socketEvents.js';
import { logActivity } from '../services/activityService.js';
import { validateText } from '../utils/validators.js';
import { cascadeTeamDelete, withTransaction } from '../services/cascadeService.js';

// Legacy alias used below
const emitTeamUpdate = emitToTeam;

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    // A duplicate shareId used to surface as an unhandled 500. Retry on the
    // unique-index violation instead, regenerating the code each time.
    let team;
    for (let attempt = 0; ; attempt++) {
      try {
        team = new Team({
          name, description,
          creator: req.user._id,
          members: [req.user._id],
          shareId: generateShareId(),
        });
        await team.save();
        break;
      } catch (err) {
        const duplicateShareId = err?.code === 11000 && err?.keyPattern?.shareId;
        if (!duplicateShareId || attempt >= 4) throw err;
      }
    }


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
      
      // Notify the team creator only. This was previously an io.emit() broadcast,
      // which delivered one member's notification to every connected client.
      if (team.creator.toString() !== req.user._id.toString()) {
        const notification = await Notification.create({
          userId: team.creator,
          type: 'info',
          title: 'New Team Member',
          message: `${req.user.name} joined your team "${team.name}"`,
          link: `/team/${id}`,
          relatedId: id,
          relatedType: 'team',
        });

        const io = req.app.get('io');
        if (io) {
          emitToUser(io, team.creator.toString(), SOCKET_EVENTS.NOTIFICATION_NEW, notification.toObject());
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

/**
 * Update a team's name or description. The client already exposed teamApi.update
 * and the README documented PUT /api/teams/:id, but no such route existed and the
 * call 404'd. Creator-only, matching delete.
 */
export const updateTeam = async (req, res) => {
  try {
    const team = req.team;
    const { name, description } = req.body;

    if (name === undefined && description === undefined) {
      return res.status(400).json({ message: 'Provide a name or description to update' });
    }

    if (name !== undefined) {
      const nameError = validateText(name, 'Team name', { min: 1, max: 100 });
      if (nameError) return res.status(400).json({ message: nameError });
      team.name = String(name).trim();
    }

    if (description !== undefined) {
      const descError = validateText(description, 'Description', { min: 0, max: 1000 });
      if (descError) return res.status(400).json({ message: descError });
      team.description = String(description).trim();
    }

    await team.save();

    const io = req.app.get('io');
    if (io) {
      emitToTeam(io, team._id.toString(), SOCKET_EVENTS.TEAM_UPDATED, {
        teamId: team._id.toString(),
        name: team.name,
        description: team.description,
      });
    }

    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Failed to update team' });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    // Creator-only; enforced by requireTeamCreator, which attaches req.team.
    const team = req.team;
    const id = team._id.toString();

    // Removes the team's proposals and every notification/activity that pointed
    // at them, which previously survived as dangling references.
    await withTransaction(async (session) => {
      await cascadeTeamDelete(id, session);
      await Team.findByIdAndDelete(id, session ? { session } : {});
    });


    // Emit to the team's own room only. A global broadcast told every connected
    // user about the deletion of a team they could not see.
    const io = req.app.get('io');
    if (io) {
      emitToTeam(io, id, SOCKET_EVENTS.TEAM_DELETED, {
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
