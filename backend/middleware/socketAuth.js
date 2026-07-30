import jwt from 'jsonwebtoken';
import { parse as parseCookies } from 'cookie';
import User from '../models/User.js';
import { AUTH_COOKIE } from '../utils/authCookie.js';

/**
 * Socket.io handshake authentication.
 *
 * Rejects any connection that does not present a valid JWT. The verified user is
 * attached as `socket.user` so room-join handlers can authorize against a real
 * identity instead of trusting client-supplied IDs.
 *
 * The token normally arrives in the httpOnly auth cookie (the browser sends it
 * because the client sets withCredentials). The `auth.token` and Authorization
 * paths remain for non-browser clients.
 */
const readToken = (socket) => {
  const cookies = socket.handshake.headers?.cookie;
  if (cookies) {
    const parsed = parseCookies(cookies);
    if (parsed[AUTH_COOKIE]) return parsed[AUTH_COOKIE];
  }

  if (socket.handshake.auth?.token) return socket.handshake.auth.token;

  const header = socket.handshake.headers?.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();

  return null;
};

export const socketAuth = async (socket, next) => {
  try {
    const token = readToken(socket);
    if (!token) return next(new Error('Unauthorized: no token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name email');

    if (!user) return next(new Error('Unauthorized: user not found'));

    socket.user = { id: user._id.toString(), name: user.name, email: user.email };
    return next();
  } catch {
    return next(new Error('Unauthorized: invalid token'));
  }
};
