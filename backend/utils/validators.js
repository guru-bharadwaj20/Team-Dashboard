export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalises an email for storage and lookup so casing cannot fork an account. */
export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const isValidEmail = (email) => {
  const value = normalizeEmail(email);
  return value.length <= 254 && EMAIL_RE.test(value);
};

/**
 * Password policy. Registration previously accepted any non-empty string, so a
 * one-character password was valid; only the change-password path checked length.
 * Returns null when acceptable, otherwise a message safe to show the user.
 */
export const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > 200) {
    return 'Password must be at most 200 characters';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
};

/** Trims and length-checks a free-text field. Returns null when acceptable. */
export const validateText = (value, label, { min = 1, max = 200 } = {}) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < min) return `${label} is required`;
  if (text.length > max) return `${label} must be at most ${max} characters`;
  return null;
};
