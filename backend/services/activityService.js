/**
 * Activity Service — fire-and-forget event logging.
 * Errors are swallowed so activity failures never break core operations.
 */

import Activity from '../models/Activity.js';
import { emitBroadcast, SOCKET_EVENTS } from '../utils/socketEvents.js';

/**
 * Log an activity event.
 * @param {Object} io - Socket.io server instance (may be null in tests)
 * @param {Object} params
 */
export const logActivity = async (io, { userId, userName, action, targetId, targetType, targetTitle, teamId, meta = {} }) => {
  try {
    const activity = await Activity.create({
      userId, userName, action, targetId, targetType, targetTitle, teamId, meta,
    });

    if (io) {
      const payload = {
        id: activity._id,
        userId, userName, action, targetId, targetType, targetTitle, teamId, meta,
        createdAt: activity.createdAt,
      };
      // Emit to the team room if applicable, otherwise global
      if (teamId) {
        io.to(`team:${teamId}`).emit(SOCKET_EVENTS.ACTIVITY_CREATED, payload);
      } else {
        emitBroadcast(io, SOCKET_EVENTS.ACTIVITY_CREATED, payload);
      }
    }
  } catch (err) {
    console.error('[Activity] Failed to log:', action, err.message);
  }
};
