// ─── Vote Options ─────────────────────────────────────────────────────────────
export const RESPONSE_OPTIONS = { AGREE: 'agree', DISAGREE: 'disagree', NEUTRAL: 'neutral' };
export const RESPONSE_LABELS  = { agree: 'Agree', disagree: 'Disagree', neutral: 'Neutral' };

// ─── Proposal Status ──────────────────────────────────────────────────────────
export const PROPOSAL_STATUS = { OPEN: 'open', CLOSED: 'closed', PENDING: 'pending', RESOLVED: 'resolved' };

export const PROPOSAL_STATUS_LABELS = {
  open:     'Open for Voting',
  closed:   'Voting Closed',
  pending:  'Pending Review',
  resolved: 'Resolved',
};

// ─── Notification Types ───────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = { INFO: 'info', SUCCESS: 'success', WARNING: 'warning', ERROR: 'error' };

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:        '/',
  LOGIN:       '/login',
  REGISTER:    '/register',
  DASHBOARD:   '/dashboard',
  ANALYTICS:   '/analytics',
  ACTIVITY:    '/activity',
  TEAM:        '/team/:id',
  PROPOSAL:    '/proposal/:id',
  PUBLIC_BOARD:'/board/:shareId',
  PROFILE:     '/profile',
  NOTIFICATIONS:'/notifications',
  ERROR:       '/error',
};

// ─── Socket Events (mirrored on backend) ─────────────────────────────────────
export const SOCKET_EVENTS = {
  // Team
  TEAM_CREATED:        'team:created',
  TEAM_UPDATED:        'team:updated',
  TEAM_DELETED:        'team:deleted',
  TEAM_MEMBER_JOINED:  'team:member-joined',

  // Proposal lifecycle
  PROPOSAL_CREATED:        'proposal:created',
  PROPOSAL_UPDATED:        'proposal:updated',
  PROPOSAL_DELETED:        'proposal:deleted',
  PROPOSAL_RESOLVED:       'proposal:resolved',
  PROPOSAL_STATUS_CHANGED: 'proposal:status-changed',

  // Voting
  VOTE_SUBMITTED: 'vote:submitted',
  VOTE_CHANGED:   'vote:changed',

  // Comments
  COMMENT_ADDED: 'comment:added',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',

  // Activity
  ACTIVITY_CREATED: 'activity:created',

  // AI
  AI_SUMMARY_READY: 'ai:summary-ready',
};

// ─── Activity Action Labels ───────────────────────────────────────────────────
export const ACTIVITY_LABELS = {
  'team.created':       'created team',
  'team.deleted':       'deleted team',
  'team.member_joined': 'joined team',
  'proposal.created':   'created proposal',
  'proposal.deleted':   'deleted proposal',
  'proposal.resolved':  'resolved proposal',
  'vote.cast':          'voted on',
  'vote.changed':       'changed vote on',
  'comment.added':      'commented on',
};
