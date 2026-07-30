import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AUTH_COOKIE } from '../utils/authCookie.js';

/**
 * Extracts the JWT from the httpOnly cookie, falling back to a Bearer header so
 * non-browser clients (curl, tests, integrations) still work.
 */
const readToken = (req) => {
  const fromCookie = req.cookies?.[AUTH_COOKIE];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  // Note the trailing space: 'Bearer' alone would also match 'Bearertoken'.
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();

  return null;
};

export const protect = async (req, res, next) => {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  let user;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    user = await User.findById(decoded.id).select('-passwordHash');
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  // A structurally valid token can still name a user who has since been deleted.
  // Without this guard req.user is null and every controller throws on req.user._id.
  if (!user) {
    return res.status(401).json({ message: 'Not authorized, user no longer exists' });
  }

  req.user = user;
  // next() is deliberately outside the try block: a downstream throw must reach the
  // error handler, not be reported here as an authentication failure.
  next();
};

/**
 * Restricts a route to users with the `admin` role.
 * Must be mounted after `protect`.
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
