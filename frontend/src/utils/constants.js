// Mock data for development
export const MOCK_TEAMS = [
  {
    id: 1,
    name: 'Product Team',
    description: 'Team responsible for product development and strategy',
    memberCount: 8,
    createdAt: '2025-01-01',
  },
  {
    id: 2,
    name: 'Engineering Team',
    description: 'Software engineering and infrastructure team',
    memberCount: 12,
    createdAt: '2025-01-05',
  },
  {
    id: 3,
    name: 'Design Team',
    description: 'UX/UI and design team',
    memberCount: 5,
    createdAt: '2025-01-10',
  },
];

export const MOCK_PROPOSALS = [
  {
    id: 1,
    teamId: 1,
    title: 'Implement Dark Mode',
    description:
      'Add dark mode support to the application for improved user experience in low-light environments.',
    status: 'open',
    createdAt: '2025-01-15',
    deadline: '2025-02-15',
    responses: { agree: 5, disagree: 1, neutral: 2 },
  },
  {
    id: 2,
    teamId: 1,
    title: 'Migrate to TypeScript',
    description:
      'Convert the codebase from JavaScript to TypeScript for better type safety and developer experience.',
    status: 'open',
    createdAt: '2025-01-12',
    deadline: '2025-02-01',
    responses: { agree: 4, disagree: 3, neutral: 1 },
  },
  {
    id: 3,
    teamId: 2,
    title: 'Upgrade Node.js Version',
    description:
      'Update Node.js from v18 to v20 to get latest features and security patches.',
    status: 'closed',
    createdAt: '2025-01-08',
    deadline: '2025-01-22',
    responses: { agree: 8, disagree: 2, neutral: 2 },
  },
];

export const MOCK_COMMENTS = [
  {
    id: 1,
    proposalId: 1,
    author: 'John Doe',
    text: 'Great idea! Dark mode would really improve accessibility.',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 2,
    proposalId: 1,
    author: 'Jane Smith',
    text: 'I agree. We should also add system preference detection.',
    createdAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 3,
    proposalId: 2,
    author: 'Mike Johnson',
    text: 'TypeScript would definitely help catch bugs early. I support this.',
    createdAt: '2025-01-12T14:20:00Z',
  },
];

// Response options
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
  open: 'Open for Feedback',
  closed: 'Feedback Closed',
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
  RESPONSE_RECORDED: 'Your response has been recorded.',
  COMMENT_ADDED: 'Comment added successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
};

// Socket event types (shared between frontend and backend)
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
