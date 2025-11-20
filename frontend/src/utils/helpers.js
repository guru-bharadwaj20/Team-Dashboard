import { RESPONSE_OPTIONS, PROPOSAL_STATUS } from './constants.js';

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

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Save auth token to localStorage
 */
export const saveAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Get current user info from localStorage
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
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
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
 * Get response option label
 */
export const getResponseLabel = (option) => {
  const labels = {
    [RESPONSE_OPTIONS.AGREE]: 'Agree',
    [RESPONSE_OPTIONS.DISAGREE]: 'Disagree',
    [RESPONSE_OPTIONS.NEUTRAL]: 'Neutral',
  };
  return labels[option] || option;
};

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
 * Get proposal status label
 */
export const getProposalStatusLabel = (status) => {
  const labels = {
    [PROPOSAL_STATUS.OPEN]: 'Open for Feedback',
    [PROPOSAL_STATUS.CLOSED]: 'Feedback Closed',
    [PROPOSAL_STATUS.PENDING]: 'Pending Review',
  };
  return labels[status] || status;
};

/**
 * Check if proposal is open for feedback
 */
export const isProposalOpen = (proposal) => {
  return proposal.status === PROPOSAL_STATUS.OPEN;
};
