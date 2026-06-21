import Proposal from '../models/Proposal.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import { emitTeamUpdate, emitProposalUpdate, SOCKET_EVENTS } from '../utils/socketEvents.js';

const computeResponses = (votes) => {
  const r = { agree: 0, disagree: 0, neutral: 0 };
  for (const v of votes) {
    if (r[v.vote] !== undefined) r[v.vote]++;
  }
  return r;
};

export const createProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, options, deadline } = req.body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Title and at least 2 options are required' });
    }
    if (options.length > 5) return res.status(400).json({ message: 'A maximum of 5 options is allowed' });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const opts = options.map((o) => ({ text: o }));
    const proposal = new Proposal({
      teamId,
      title,
      description,
      options: opts,
      deadline: deadline ? new Date(deadline) : undefined,
      creator: req.user._id,
    });
    await proposal.save();

    // Notify all team members except creator
    const notificationsToCreate = team.members
      .filter((memberId) => memberId.toString() !== req.user._id.toString())
      .map((memberId) => ({
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

    const io = req.app.get('io');
    if (io) {
      emitTeamUpdate(io, teamId, SOCKET_EVENTS.PROPOSAL_CREATED, {
        proposal,
        teamId,
        creator: { id: req.user._id, name: req.user.name },
      });

      team.members.forEach((memberId) => {
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
    const withCounts = proposals.map((p) => ({
      ...p.toObject(),
      responses: computeResponses(p.votes),
      totalVotes: p.votes.length,
    }));
    res.json(withCounts);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Failed to fetch proposals', error: error.message });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id)
      .populate('creator', 'name email')
      .populate('comments.user', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const responses = computeResponses(proposal.votes);

    // Determine the requesting user's existing vote (if any)
    const userId = req.user?._id?.toString();
    const userVote = userId
      ? (proposal.votes.find((v) => v.user.toString() === userId)?.vote || null)
      : null;

    res.json({
      ...proposal.toObject(),
      responses,
      totalVotes: proposal.votes.length,
      userVote,
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Failed to fetch proposal', error: error.message });
  }
};

export const voteOnProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;

    if (!['agree', 'disagree', 'neutral'].includes(vote)) {
      return res.status(400).json({ message: 'Vote must be agree, disagree, or neutral' });
    }

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    if (proposal.status !== 'open') {
      return res.status(400).json({ message: 'This proposal is not open for voting' });
    }

    const existingIdx = proposal.votes.findIndex(
      (v) => v.user.toString() === req.user._id.toString()
    );

    if (existingIdx >= 0) {
      proposal.votes[existingIdx].vote = vote;
    } else {
      proposal.votes.push({ user: req.user._id, vote });
    }

    await proposal.save();

    const responses = computeResponses(proposal.votes);

    const io = req.app.get('io');
    if (io) {
      emitProposalUpdate(io, id, SOCKET_EVENTS.PROPOSAL_UPDATED, {
        proposalId: id,
        responses,
        totalVotes: proposal.votes.length,
      });
    }

    res.json({
      message: 'Vote recorded',
      responses,
      totalVotes: proposal.votes.length,
      userVote: vote,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to vote' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.comments.push({ user: req.user._id, text });
    await proposal.save();

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

    const io = req.app.get('io');
    if (io) {
      const populatedProposal = await Proposal.findById(id).populate('comments.user', 'name');
      const newComment = populatedProposal.comments[populatedProposal.comments.length - 1];

      emitProposalUpdate(io, id, SOCKET_EVENTS.COMMENT_ADDED, {
        proposalId: id,
        comment: newComment,
      });

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

    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    if (proposal.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this proposal' });
    }

    const teamId = proposal.teamId;
    await Proposal.findByIdAndDelete(id);

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
