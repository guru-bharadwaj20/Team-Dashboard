import Proposal from '../models/Proposal.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { emitTeamUpdate, emitProposalUpdate, SOCKET_EVENTS } from '../utils/socketEvents.js';

export const createProposal = async (req, res) => {
  try {
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
    
    // Create notifications for all team members except creator
    const notificationsToCreate = team.members
      .filter(memberId => memberId.toString() !== req.user._id.toString())
      .map(memberId => ({
        userId: memberId,
        type: 'info',
        title: 'New Proposal',
        message: `New proposal "${title}" created in team "${team.name}"`,
        link: `/proposal/${proposal._id}`,
        relatedId: proposal._id,
        relatedType: 'proposal',
      }));

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
    
    // Emit socket event for new proposal
    const io = req.app.get('io');
    if (io) {
      emitTeamUpdate(io, teamId, SOCKET_EVENTS.PROPOSAL_CREATED, {
        proposal,
        teamId,
        creator: { id: req.user._id, name: req.user.name },
      });
      
      // Send real-time notifications to all team members
      team.members.forEach(memberId => {
        if (memberId.toString() !== req.user._id.toString()) {
          io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
            userId: memberId.toString(),
            type: 'info',
            title: 'New Proposal',
            message: `New proposal "${title}" created in team "${team.name}"`,
            link: `/proposal/${proposal._id}`,
          });
        }
      });
    }
    
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Failed to create proposal', error: error.message });
  }
};

export const getProposalsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const proposals = await Proposal.find({ teamId });
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Failed to fetch proposals', error: error.message });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id).populate('creator', 'name email').populate('comments.user', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Failed to fetch proposal', error: error.message });
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
    
    // Notify proposal creator if someone else comments
    if (proposal.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: proposal.creator,
        type: 'info',
        title: 'New Comment',
        message: `${req.user.name} commented on your proposal "${proposal.title}"`,
        link: `/proposal/${id}`,
        relatedId: id,
        relatedType: 'comment',
      });
    }
    
    // Emit socket event for new comment
    const io = req.app.get('io');
    if (io) {
      const populatedProposal = await Proposal.findById(id).populate('comments.user', 'name');
      const newComment = populatedProposal.comments[populatedProposal.comments.length - 1];
      
      emitProposalUpdate(io, id, SOCKET_EVENTS.COMMENT_ADDED, {
        proposalId: id,
        comment: newComment,
      });
      
      // Send real-time notification to proposal creator
      if (proposal.creator.toString() !== req.user._id.toString()) {
        io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
          userId: proposal.creator.toString(),
          type: 'info',
          title: 'New Comment',
          message: `${req.user.name} commented on your proposal "${proposal.title}"`,
          link: `/proposal/${id}`,
        });
      }
    }
    
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to add comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id).populate('comments.user', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
  }
};

export const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    // Check if user is the creator or team admin
    if (proposal.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this proposal' });
    }
    
    const teamId = proposal.teamId;
    await Proposal.findByIdAndDelete(id);
    
    // Emit socket event for proposal deletion
    const io = req.app.get('io');
    if (io) {
      emitTeamUpdate(io, teamId.toString(), SOCKET_EVENTS.PROPOSAL_DELETED, {
        proposalId: id,
        teamId: teamId.toString(),
      });
    }
    
    res.json({ message: 'Proposal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete proposal' });
  }
};
