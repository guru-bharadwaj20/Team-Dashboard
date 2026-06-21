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

// General API limit
export const apiLimiter = make(60 * 1000, 120, 'Too many requests — slow down');

// Export / AI generation — expensive operations
export const heavyLimiter = make(60 * 1000, 10, 'Too many export requests — try again in a minute');
