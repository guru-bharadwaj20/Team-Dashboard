// Socket event types (must match backend)
export const SOCKET_EVENTS = {
  // Team events
  TEAM_CREATED: 'team:created',
  TEAM_UPDATED: 'team:updated',
  TEAM_DELETED: 'team:deleted',
  TEAM_MEMBER_JOINED: 'team:member-joined',
  
  // Proposal events
  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_UPDATED: 'proposal:updated',
  PROPOSAL_DELETED: 'proposal:deleted',
  PROPOSAL_STATUS_CHANGED: 'proposal:status-changed',
  
  // Comment events
  COMMENT_ADDED: 'comment:added',
  
  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_NEW: 'notification:new',
};
