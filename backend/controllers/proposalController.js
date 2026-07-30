import Proposal from '../models/Proposal.js';
import Comment from '../models/Comment.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import { emitToTeam, emitToProposal, emitToUser, SOCKET_EVENTS } from '../utils/socketEvents.js';
import { evaluateConsensus } from '../services/consensusService.js';
import { generateSummary } from '../services/aiSummaryService.js';
import { logActivity } from '../services/activityService.js';
import { validateText } from '../utils/validators.js';
import { closeProposalIfExpired } from '../services/deadlineService.js';
import { cascadeProposalDelete } from '../services/cascadeService.js';
import { logger } from '../utils/logger.js';

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
      // Emit the persisted document verbatim so the socket payload and the REST
      // payload have identical shapes (notably `_id`, `read` and `createdAt`).
      emitToUser(io, userId.toString(), SOCKET_EVENTS.NOTIFICATION_NEW, n.toObject());
    }
  } catch (err) {
    logger.error('[Notification] Failed to create:', err.message);
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const createProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, options, deadline } = req.body;

    const titleError = validateText(title, 'Title', { min: 1, max: 200 });
    if (titleError) return res.status(400).json({ message: titleError });

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be text' });
    }
    if (typeof description === 'string' && description.length > 5000) {
      return res.status(400).json({ message: 'Description must be at most 5000 characters' });
    }

    if (!Array.isArray(options)) {
      return res.status(400).json({ message: 'Options must be a list' });
    }

    // Each option must be a non-empty string. Previously this was
    // String(o).trim(), which silently turned a submitted object into the literal
    // "[object Object]" and accepted empty strings.
    const cleanedOptions = [];
    for (const option of options) {
      if (typeof option !== 'string') {
        return res.status(400).json({ message: 'Each option must be text' });
      }
      const text = option.trim();
      if (!text) return res.status(400).json({ message: 'Options cannot be empty' });
      if (text.length > 200) {
        return res.status(400).json({ message: 'Each option must be at most 200 characters' });
      }
      cleanedOptions.push(text);
    }

    if (cleanedOptions.length < 2) {
      return res.status(400).json({ message: 'At least 2 options are required' });
    }
    if (cleanedOptions.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 options allowed' });
    }
    if (new Set(cleanedOptions.map((o) => o.toLowerCase())).size !== cleanedOptions.length) {
      return res.status(400).json({ message: 'Options must be unique' });
    }

    let deadlineDate;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (Number.isNaN(deadlineDate.getTime())) {
        return res.status(400).json({ message: 'Deadline is not a valid date' });
      }
    }

    // Membership already enforced by requireTeamMember, which attaches req.team.
    const team = req.team;

    const proposal = await Proposal.create({
      teamId,
      title: title.trim(),
      description: description?.trim(),
      options: cleanedOptions.map((text) => ({ text })),
      deadline: deadlineDate,
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
    logger.error('createProposal:', err);
    res.status(500).json({ message: 'Failed to create proposal' });
  }
};

export const getProposalsByTeam = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = { teamId: req.params.teamId };

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(filter),
    ]);

    res.json({
      proposals: proposals.map((p) => ({
        ...p,
        responses: computeResponses(p.votes),
        totalVotes: p.votes.length,
      })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    logger.error('getProposalsByTeam:', err);
    res.status(500).json({ message: 'Failed to fetch proposals' });
  }
};

export const getProposalById = async (req, res) => {
  try {
    // Lazily enforce the deadline so a stale 'open' status is corrected the
    // moment anyone looks at the proposal, not only on the next sweep.
    await closeProposalIfExpired(req.proposal, req.app.get('io'));

    const proposal = await Proposal.findById(req.params.id)
      .populate('creator', 'name email');
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

    // requireProposalMember already loaded and authorized these.
    const existing = req.proposal;
    const team = req.team;

    if (existing.status !== 'open') {
      return res.status(400).json({ message: 'This proposal is not open for voting' });
    }

    if (existing.deadline && existing.deadline.getTime() < Date.now()) {
      // Close it now rather than silently accepting a late vote.
      await closeProposalIfExpired(existing, req.app.get('io'));
      return res.status(400).json({ message: 'The deadline for this proposal has passed' });
    }

    const userId = req.user._id;
    const previous = existing.votes.find((v) => v.user.equals(userId));
    const isChange = !!previous;
    const previousVote = previous?.vote ?? null;

    if (isChange && previousVote === vote) {
      const responses = computeResponses(existing.votes);
      return res.json({
        message: 'Vote unchanged',
        responses,
        totalVotes: existing.votes.length,
        userVote: vote,
        consensusReached: existing.consensusReached,
        consensusPercentage: existing.consensusPercentage,
        status: existing.status,
      });
    }

    // Single atomic update, conditioned on whether this user has already voted.
    // The previous read-modify-write via document.save() could lose one of two
    // concurrent votes, because each writer serialised its own stale array.
    const proposal = isChange
      ? await Proposal.findOneAndUpdate(
          { _id: id, status: 'open', 'votes.user': userId },
          { $set: { 'votes.$.vote': vote } },
          { new: true }
        )
      : await Proposal.findOneAndUpdate(
          { _id: id, status: 'open', 'votes.user': { $ne: userId } },
          { $push: { votes: { user: userId, vote, createdAt: new Date() } } },
          { new: true }
        );

    if (!proposal) {
      // Lost the race: the proposal closed, or the vote was recorded concurrently.
      return res.status(409).json({ message: 'Vote could not be recorded, please retry' });
    }

    // ── Consensus check ──────────────────────────────────────────────
    const { reached, agreePercentage } = evaluateConsensus(
      proposal.votes,
      team?.members?.length || 0
    );

    let resolved = false;
    if (reached && !proposal.consensusReached) {
      // Conditioned on consensusReached being false so exactly one concurrent
      // voter can flip the proposal to resolved and fire the notifications.
      const claimed = await Proposal.findOneAndUpdate(
        { _id: id, consensusReached: false },
        {
          $set: {
            status: 'resolved',
            consensusReached: true,
            consensusPercentage: Math.round(agreePercentage),
            closedAt: new Date(),
          },
        },
        { new: true }
      );
      if (claimed) {
        resolved = true;
        proposal.status = claimed.status;
        proposal.consensusReached = claimed.consensusReached;
        proposal.consensusPercentage = claimed.consensusPercentage;
        proposal.closedAt = claimed.closedAt;
      }
    }

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
        const payload = {
          proposalId: id,
          teamId: proposal.teamId,
          consensusPercentage: proposal.consensusPercentage,
          closedAt: proposal.closedAt,
          title: proposal.title,
        };
        // Emitted to both rooms. Anyone viewing the proposal page is only in the
        // proposal room, so a team-only emit meant the people actually watching
        // the decision never saw it resolve or received the AI summary.
        emitToTeam(io, proposal.teamId.toString(), SOCKET_EVENTS.PROPOSAL_RESOLVED, payload);
        emitToProposal(io, id, SOCKET_EVENTS.PROPOSAL_RESOLVED, payload);
      }

      // Notify every member except the person whose vote triggered resolution —
      // they just performed the action and do not need to be told about it.
      const members = (team?.members || []).filter(
        (memberId) => memberId.toString() !== req.user._id.toString()
      );
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
          // Comments are a separate collection now; the summariser still expects
          // them on the proposal object it is handed.
          const comments = await Comment.find({ proposalId: id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('text')
            .lean();
          const summary = await generateSummary({ ...fresh.toObject(), comments: comments.reverse() });
          if (summary) {
            await Proposal.findByIdAndUpdate(id, { aiSummary: summary });
            if (io) emitToProposal(io, id, SOCKET_EVENTS.AI_SUMMARY_READY, { proposalId: id, summary });
          }
        } catch (e) {
          logger.error('[AI] Background summary error:', e.message);
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
    logger.error('voteOnProposal:', err);
    res.status(500).json({ message: 'Failed to record vote' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Comment too long (max 2000 chars)' });
    }

    const proposal = req.proposal;

    // One insert into its own collection, rather than pushing onto an embedded
    // array and rewriting the whole proposal document.
    const created = await Comment.create({
      proposalId: proposal._id,
      teamId: proposal.teamId,
      user: req.user._id,
      text: text.trim(),
    });
    await Proposal.updateOne({ _id: proposal._id }, { $inc: { commentCount: 1 } });

    const newComment = await Comment.findById(created._id).populate('user', 'name').lean();

    const io = req.app.get('io');
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

    // Return the created comment so the author can render it without refetching
    // the whole thread (which raced the socket broadcast and produced duplicates).
    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (err) {
    logger.error('addComment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

/**
 * Paginated comment thread. The whole array used to be returned unconditionally,
 * which had no ceiling as a thread grew.
 */
export const getComments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const proposalId = req.proposal._id;

    const [comments, total] = await Promise.all([
      Comment.find({ proposalId })
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .lean(),
      Comment.countDocuments({ proposalId }),
    ]);

    res.json({
      comments,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    logger.error('getComments:', err);
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
    // Drop notifications and activity rows that referenced this proposal, which
    // otherwise remained as links to a 404.
    await cascadeProposalDelete(proposal._id);

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
