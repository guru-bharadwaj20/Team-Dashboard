import rateLimit from 'express-rate-limit';

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Strict limit for auth routes (brute-force protection)
export const authLimiter = make(15 * 60 * 1000, 20, 'Too many auth attempts — try again in 15 minutes');

// Registration is the one endpoint that must tell a caller whether an email is
// already taken, which makes it an account-enumeration oracle. Without an email
// verification flow the disclosure cannot be removed, so it is rate-limited hard
// enough that sweeping a list of addresses is impractical.
export const registerLimiter = make(60 * 60 * 1000, 5, 'Too many registration attempts — try again later');

// General API limit
export const apiLimiter = make(60 * 1000, 120, 'Too many requests — slow down');

// Export / AI generation — expensive operations
export const heavyLimiter = make(60 * 1000, 10, 'Too many export requests — try again in a minute');
