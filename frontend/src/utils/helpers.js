import { PROPOSAL_STATUS, PROPOSAL_STATUS_LABELS, RESPONSE_LABELS, RESPONSE_OPTIONS } from './constants.js';

/**
 * Format a date to a readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date to show time relative to now (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

/**
 * Calculate response percentages
 */
export const calculateResponsePercentages = (responses) => {
  if (!responses) return { agree: 0, disagree: 0, neutral: 0 };

  const total = responses.agree + responses.disagree + responses.neutral;
  if (total === 0)
    return {
      agree: 0,
      disagree: 0,
      neutral: 0,
    };

  return {
    agree: Math.round((responses.agree / total) * 100),
    disagree: Math.round((responses.disagree / total) * 100),
    neutral: Math.round((responses.neutral / total) * 100),
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate password strength. Mirrors the server policy in
 * backend/utils/validators.js — keep the two in step.
 * Returns null when acceptable, otherwise a message to show the user.
 */
export const getPasswordError = (password) => {
  if (!password) return 'Password is required';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
};

export const isValidPassword = (password) => getPasswordError(password) === null;

/**
 * Whether a session is likely active.
 *
 * The JWT lives in an httpOnly cookie and is deliberately unreadable from
 * JavaScript, so this reflects the cached profile only. The server is the
 * authority — AuthContext confirms with GET /auth/me on boot.
 */
export const isAuthenticated = () => !!getCurrentUser();

/**
 * Get current user info from localStorage.
 * Only non-sensitive profile fields are cached here, never a credential.
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    // A corrupt value would otherwise throw on every read and blank the app.
    localStorage.removeItem('currentUser');
    return null;
  }
};

/**
 * Save current user info to localStorage
 */
export const saveCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

/**
 * Remove current user info from localStorage
 */
export const removeCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  // slice, not the deprecated substr.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Debounce function to limit function call frequency
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get response option label. Reads the shared RESPONSE_LABELS map rather than
 * rebuilding an identical table on every call.
 */
export const getResponseLabel = (option) => RESPONSE_LABELS[option] || option;

/**
 * Get response option color
 */
export const getResponseColor = (option) => {
  const colors = {
    [RESPONSE_OPTIONS.AGREE]: '#86efac',
    [RESPONSE_OPTIONS.DISAGREE]: '#fca5a5',
    [RESPONSE_OPTIONS.NEUTRAL]: '#fbbf24',
  };
  return colors[option] || '#e5e7eb';
};

/**
 * Get proposal status label.
 *
 * Delegates to the single PROPOSAL_STATUS_LABELS map in constants.js. This used
 * to hold a second, competing table that disagreed with it ("Open for Feedback"
 * vs "Open for Voting") and omitted `resolved` entirely.
 */
export const getProposalStatusLabel = (status) => PROPOSAL_STATUS_LABELS[status] || status;

/**
 * Check if proposal is open for feedback
 */
export const isProposalOpen = (proposal) => {
  return proposal.status === PROPOSAL_STATUS.OPEN;
};
