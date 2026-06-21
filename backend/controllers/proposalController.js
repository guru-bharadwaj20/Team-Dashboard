import Proposal from '../models/Proposal.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import { emitToTeam, emitToProposal, emitToUser, SOCKET_EVENTS } from '../utils/socketEvents.js';
import { evaluateConsensus } from '../services/consensusService.js';
import { generateSummary } from '../services/aiSummaryService.js';
import { logActivity } from '../services/activityService.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const computeResponses = (votes) => {
  const r = { agree: 0, disagree: 0, neutral: 0 };
  for (const v of votes) if (r[v.vote] !== undefined) r[v.vote]++;
  return r;
};

const notifyUser = async (io, userId, { type, title, message, link, relatedId, relatedType }) => {
  try {
    const n = await Notification.create({ userId, type, title, message, link, relatedId, relatedType });
    if (io) {
      emitToUser(io, userId.toString(), SOCKET_EVENTS.NOTIFICATION_NEW, {
        id: n._id, userId, type, title, message, link,
      });
    }
  } catch (err) {
    console.error('[Notification] Failed to create:', err.message);
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const createProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, options, deadline } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!Array.isArray(options) || options.length < 2) return res.status(400).json({ message: 'At least 2 options are required' });
    if (options.length > 5) return res.status(400).json({ message: 'Maximum 5 options allowed' });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const proposal = await Proposal.create({
      teamId,
      title: title.trim(),
      description: description?.trim(),
      options: options.map((o) => ({ text: String(o).trim() })),
      deadline: deadline ? new Date(deadline) : undefined,
      creator: req.user._id,
    });

    const io = req.app.get('io');

    // Notify all team members except creator
    const others = team.members.filter((m) => m.toString() !== req.user._id.toString());
    await Promise.all(
      others.map((memberId) =>
        notifyUser(io, memberId, {
          type: 'info', title: 'New Proposal',
          message: `"${title}" was posted in ${team.name}`,
          link: `/proposal/${proposal._id}`,
          relatedId: proposal._id, relatedType: 'proposal',
        })
      )
    );

    if (io) emitToTeam(io, teamId, SOCKET_EVENTS.PROPOSAL_CREATED, { proposal, teamId, creator: { id: req.user._id, name: req.user.name } });

    await logActivity(io, {
      userId: req.user._id, userName: req.user.name,
      action: 'proposal.created', targetId: proposal._id,
      targetType: 'proposal', targetTitle: title, teamId,
    });

    res.status(201).json(proposal);
  } catch (err) {
    console.error('createProposal:', err);
    res.status(500).json({ message: 'Failed to create proposal' });
  }
};

export const getProposalsByTeam = async (req, res) => {
  try {
    const proposals = await Proposal.find({ teamId: req.params.teamId }).sort({ createdAt: -1 });
    res.json(proposals.map((p) => ({ ...p.toObject(), responses: computeResponses(p.votes), totalVotes: p.votes.length })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch proposals' });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('comments.user', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const responses = computeResponses(proposal.votes);
    const userId = req.user?._id?.toString();
    const userVote = userId ? (proposal.votes.find((v) => v.user.toString() === userId)?.vote || null) : null;

    res.json({ ...proposal.toObject(), responses, totalVotes: proposal.votes.length, userVote });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch proposal' });
  }
};

export const voteOnProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;

    if (!['agree', 'disagree', 'neutral'].includes(vote))
      return res.status(400).json({ message: 'vote must be agree, disagree, or neutral' });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.status !== 'open') return res.status(400).json({ message: 'This proposal is not open for voting' });

    const existingIdx = proposal.votes.findIndex((v) => v.user.toString() === req.user._id.toString());
    const isChange = existingIdx >= 0;
    const previousVote = isChange ? proposal.votes[existingIdx].vote : null;

    if (isChange) {
      proposal.votes[existingIdx].vote = vote;
    } else {
      proposal.votes.push({ user: req.user._id, vote });
    }

    // ── Consensus check ──────────────────────────────────────────────
    const team = await Team.findById(proposal.teamId);
    const { reached, agreePercentage, participationRate } = evaluateConsensus(proposal.votes, team?.members?.length || 1);

    let resolved = false;
    if (reached && !proposal.consensusReached) {
      proposal.status = 'resolved';
      proposal.consensusReached = true;
      proposal.consensusPercentage = Math.round(agreePercentage);
      proposal.closedAt = new Date();
      resolved = true;
    }

    await proposal.save();

    const responses = computeResponses(proposal.votes);
    const io = req.app.get('io');

    // Emit vote update to all watchers
    const voteEvent = isChange ? SOCKET_EVENTS.VOTE_CHANGED : SOCKET_EVENTS.VOTE_SUBMITTED;
    if (io) {
      emitToProposal(io, id, voteEvent, {
        proposalId: id, responses, totalVotes: proposal.votes.length,
        userId: req.user._id, vote, previousVote,
      });
      emitToProposal(io, id, SOCKET_EVENTS.PROPOSAL_UPDATED, {
        proposalId: id, responses, totalVotes: proposal.votes.length,
        consensusReached: proposal.consensusReached, consensusPercentage: proposal.consensusPercentage,
        status: proposal.status,
      });
    }

    // ── If consensus reached → emit resolution + trigger AI summary ──
    if (resolved) {
      if (io) {
        emitToTeam(io, proposal.teamId.toString(), SOCKET_EVENTS.PROPOSAL_RESOLVED, {
          proposalId: id, teamId: proposal.teamId,
          consensusPercentage: proposal.consensusPercentage,
          title: proposal.title,
        });
      }

      // Notify all team members
      const members = team?.members || [];
      await Promise.all(
        members.map((memberId) =>
          notifyUser(io, memberId, {
            type: 'success', title: 'Consensus Reached!',
            message: `"${proposal.title}" was resolved with ${proposal.consensusPercentage}% agreement`,
            link: `/proposal/${id}`, relatedId: id, relatedType: 'proposal',
          })
        )
      );

      await logActivity(io, {
        userId: req.user._id, userName: req.user.name,
        action: 'proposal.resolved', targetId: proposal._id,
        targetType: 'proposal', targetTitle: proposal.title, teamId: proposal.teamId,
        meta: { consensusPercentage: proposal.consensusPercentage },
      });

      // ── AI summary (non-blocking, fire-and-forget) ────────────────
      setImmediate(async () => {
        try {
          const fresh = await Proposal.findById(id);
          if (!fresh || fresh.aiSummary) return; // already generated
          const summary = await generateSummary(fresh.toObject());
          if (summary) {
            await Proposal.findByIdAndUpdate(id, { aiSummary: summary });
            if (io) emitToProposal(io, id, SOCKET_EVENTS.AI_SUMMARY_READY, { proposalId: id, summary });
          }
        } catch (e) {
          console.error('[AI] Background summary error:', e.message);
        }
      });
    }

    await logActivity(io, {
      userId: req.user._id, userName: req.user.name,
      action: isChange ? 'vote.changed' : 'vote.cast',
      targetId: proposal._id, targetType: 'proposal', targetTitle: proposal.title,
      teamId: proposal.teamId, meta: { vote, previousVote },
    });

    res.json({
      message: isChange ? 'Vote updated' : 'Vote recorded',
      responses, totalVotes: proposal.votes.length, userVote: vote,
      consensusReached: proposal.consensusReached,
      consensusPercentage: proposal.consensusPercentage,
      status: proposal.status,
    });
  } catch (err) {
    console.error('voteOnProposal:', err);
    res.status(500).json({ message: 'Failed to record vote' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });
    if (text.length > 2000) return res.status(400).json({ message: 'Comment too long (max 2000 chars)' });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.comments.push({ user: req.user._id, text: text.trim() });
    await proposal.save();

    const io = req.app.get('io');
    const populated = await Proposal.findById(id).populate('comments.user', 'name');
    const newComment = populated.comments[populated.comments.length - 1];

    if (io) emitToProposal(io, id, SOCKET_EVENTS.COMMENT_ADDED, { proposalId: id, comment: newComment });

    // Notify creator if someone else comments
    if (proposal.creator.toString() !== req.user._id.toString()) {
      await notifyUser(io, proposal.creator, {
        type: 'info', title: 'New Comment',
        message: `${req.user.name} commented on "${proposal.title}"`,
        link: `/proposal/${id}`, relatedId: id, relatedType: 'comment',
      });
    }

    await logActivity(io, {
      userId: req.user._id, userName: req.user.name,
      action: 'comment.added', targetId: proposal._id,
      targetType: 'comment', targetTitle: proposal.title, teamId: proposal.teamId,
    });

    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('comments.user', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal.comments);
  } catch {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const teamId = proposal.teamId.toString();
    await proposal.deleteOne();

    const io = req.app.get('io');
    if (io) emitToTeam(io, teamId, SOCKET_EVENTS.PROPOSAL_DELETED, { proposalId: id, teamId });

    await logActivity(io, {
      userId: req.user._id, userName: req.user.name,
      action: 'proposal.deleted', targetId: proposal._id,
      targetType: 'proposal', targetTitle: proposal.title, teamId,
    });

    res.json({ message: 'Proposal deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete proposal' });
  }
};
