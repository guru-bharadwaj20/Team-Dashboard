// Vote options
export const RESPONSE_OPTIONS = {
  AGREE: 'agree',
  DISAGREE: 'disagree',
  NEUTRAL: 'neutral',
};

export const RESPONSE_LABELS = {
  agree: 'Agree',
  disagree: 'Disagree',
  neutral: 'Neutral',
};

// Proposal statuses
export const PROPOSAL_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  PENDING: 'pending',
};

export const PROPOSAL_STATUS_LABELS = {
  open: 'Open for Voting',
  closed: 'Voting Closed',
  pending: 'Pending Review',
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TEAM: '/team/:id',
  PROPOSAL: '/proposal/:id',
  PUBLIC_BOARD: '/board/:shareId',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  ERROR: '/error',
};

// API Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  REGISTER_SUCCESS: 'Account created successfully. Please log in.',
  TEAM_CREATED: 'Team created successfully.',
  PROPOSAL_CREATED: 'Proposal created successfully.',
  VOTE_RECORDED: 'Your vote has been recorded.',
  COMMENT_ADDED: 'Comment added successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
};

// Socket event types (mirrored on backend)
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
