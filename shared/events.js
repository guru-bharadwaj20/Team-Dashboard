/**
 * Contract shared by the server and the SPA.
 *
 * These tables previously existed twice (socket events) and four times (activity
 * labels) across backend/utils/socketEvents.js, backend/controllers/
 * activityController.js, frontend/src/utils/constants.js, frontend Analytics and
 * frontend ActivityTimeline. Nothing kept the copies in step, so a renamed event
 * or a new action silently worked on one side only.
 *
 * Plain ESM with no dependencies, imported directly by both packages.
 */

export const SOCKET_EVENTS = {
  // Team
  TEAM_UPDATED: 'team:updated',
  TEAM_DELETED: 'team:deleted',
  TEAM_MEMBER_JOINED: 'team:member-joined',

  // Proposal lifecycle
  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_UPDATED: 'proposal:updated',
  PROPOSAL_DELETED: 'proposal:deleted',
  PROPOSAL_RESOLVED: 'proposal:resolved',   // consensus reached + auto-close
  PROPOSAL_STATUS_CHANGED: 'proposal:status-changed', // e.g. closed on deadline

  // Voting
  VOTE_SUBMITTED: 'vote:submitted',   // first vote from a user
  VOTE_CHANGED: 'vote:changed',       // user changed an existing vote

  // Comments
  COMMENT_ADDED: 'comment:added',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',

  // Activity feed
  ACTIVITY_CREATED: 'activity:created',

  // AI
  AI_SUMMARY_READY: 'ai:summary-ready',
};

/** Every value Activity.action may hold. */
export const ACTIVITY_ACTIONS = [
  'team.created',
  'team.deleted',
  'team.member_joined',
  'proposal.created',
  'proposal.deleted',
  'proposal.resolved',
  'vote.cast',
  'vote.changed',
  'comment.added',
];

/** Human phrasing, rendered as "<user> <label> <target>". */
export const ACTIVITY_LABELS = {
  'team.created': 'created team',
  'team.deleted': 'deleted team',
  'team.member_joined': 'joined team',
  'proposal.created': 'created proposal',
  'proposal.deleted': 'deleted proposal',
  'proposal.resolved': 'resolved proposal',
  'vote.cast': 'voted on',
  'vote.changed': 'changed vote on',
  'comment.added': 'commented on',
};

export const ACTIVITY_ICONS = {
  'team.created': '🏗️',
  'team.deleted': '🗑️',
  'team.member_joined': '👋',
  'proposal.created': '📝',
  'proposal.deleted': '🗑️',
  'proposal.resolved': '🎯',
  'vote.cast': '🗳️',
  'vote.changed': '🔄',
  'comment.added': '💬',
};

export const PROPOSAL_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  PENDING: 'pending',
  RESOLVED: 'resolved',
};

export const PROPOSAL_STATUS_LABELS = {
  open: 'Open for Voting',
  closed: 'Voting Closed',
  pending: 'Pending Review',
  resolved: 'Resolved',
};

export const RESPONSE_OPTIONS = { AGREE: 'agree', DISAGREE: 'disagree', NEUTRAL: 'neutral' };

export const RESPONSE_LABELS = { agree: 'Agree', disagree: 'Disagree', neutral: 'Neutral' };
