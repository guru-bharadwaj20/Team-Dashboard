// ─── Emitters ────────────────────────────────────────────────────────────────

export const emitToTeam = (io, teamId, event, data) =>
  io.to(`team:${teamId}`).emit(event, data);

export const emitToProposal = (io, proposalId, event, data) =>
  io.to(`proposal:${proposalId}`).emit(event, data);

export const emitToUser = (io, userId, event, data) =>
  io.to(`user:${userId}`).emit(event, data);

export const emitBroadcast = (io, event, data) =>
  io.emit(event, data);

// Legacy aliases (keep backwards compatibility)
export const emitTeamUpdate = emitToTeam;
export const emitProposalUpdate = emitToProposal;
export const emitGlobalNotification = emitBroadcast;

// ─── Event Constants ──────────────────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Team
  TEAM_CREATED: 'team:created',
  TEAM_UPDATED: 'team:updated',
  TEAM_DELETED: 'team:deleted',
  TEAM_MEMBER_JOINED: 'team:member-joined',

  // Proposal lifecycle
  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_UPDATED: 'proposal:updated',
  PROPOSAL_DELETED: 'proposal:deleted',
  PROPOSAL_RESOLVED: 'proposal:resolved',   // consensus reached + auto-close
  PROPOSAL_STATUS_CHANGED: 'proposal:status-changed',

  // Voting
  VOTE_SUBMITTED: 'vote:submitted',   // first vote from a user
  VOTE_CHANGED: 'vote:changed',       // user changed existing vote

  // Comments
  COMMENT_ADDED: 'comment:added',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',

  // Activity feed
  ACTIVITY_CREATED: 'activity:created',

  // AI
  AI_SUMMARY_READY: 'ai:summary-ready',
};
