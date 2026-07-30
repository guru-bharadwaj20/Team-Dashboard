import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Socket.io handshake authentication.
 *
 * Rejects any connection that does not present a valid JWT. The verified user is
 * attached as `socket.user` so room-join handlers can authorize against a real
 * identity instead of trusting client-supplied IDs.
 */
export const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer /, '');

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
