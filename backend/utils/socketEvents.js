// Socket.io event handlers and utilities
export const emitTeamUpdate = (io, teamId, event, data) => {
  io.to(`team:${teamId}`).emit(event, data);
};

export const emitProposalUpdate = (io, proposalId, event, data) => {
  io.to(`proposal:${proposalId}`).emit(event, data);
};

export const emitGlobalNotification = (io, event, data) => {
  io.emit(event, data);
};

// Socket event constants (shared with frontend)
export const SOCKET_EVENTS = {
  TEAM_CREATED: 'team:created',
  TEAM_UPDATED: 'team:updated',
  TEAM_DELETED: 'team:deleted',
  TEAM_MEMBER_JOINED: 'team:member-joined',
  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_UPDATED: 'proposal:updated',
  PROPOSAL_DELETED: 'proposal:deleted',
  PROPOSAL_STATUS_CHANGED: 'proposal:status-changed',
  COMMENT_ADDED: 'comment:added',
  NOTIFICATION: 'notification',
  NOTIFICATION_NEW: 'notification:new',
};
