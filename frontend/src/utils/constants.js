// The socket-event names, activity tables and status labels are the contract
// between this app and the API, so they live in one place at the repo root and
// are re-exported here. They used to be re-declared in each package (and the
// activity labels in four separate files), with nothing keeping them in step.
export {
  SOCKET_EVENTS,
  ACTIVITY_ACTIONS,
  ACTIVITY_LABELS,
  ACTIVITY_ICONS,
  PROPOSAL_STATUS,
  PROPOSAL_STATUS_LABELS,
  RESPONSE_OPTIONS,
  RESPONSE_LABELS,
} from '../../../shared/events.js';

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
