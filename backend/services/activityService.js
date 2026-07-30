/**
 * Activity Service — fire-and-forget event logging.
 * Errors are swallowed so activity failures never break core operations.
 */

import Activity from '../models/Activity.js';
import { emitToTeam, SOCKET_EVENTS } from '../utils/socketEvents.js';

/**
 * Log an activity event.
 * @param {Object} io - Socket.io server instance (may be null in tests)
 * @param {Object} params
 */
export const logActivity = async (
  io,
  { userId, userName, action, targetId, targetType, targetTitle, teamId, meta = {} }
) => {
  try {
    const activity = await Activity.create({
      userId, userName, action, targetId, targetType, targetTitle, teamId, meta,
    });

    // Activity is always team-scoped. The previous fallback broadcast rows with
    // no teamId to every connected client, which would have leaked one team's
    // activity to everyone; there is no audience for an unscoped activity, so a
    // missing teamId is a logging bug rather than a reason to broadcast.
    if (io && teamId) {
      emitToTeam(io, teamId.toString(), SOCKET_EVENTS.ACTIVITY_CREATED, {
        id: activity._id,
        userId, userName, action, targetId, targetType, targetTitle, teamId, meta,
        createdAt: activity.createdAt,
      });
    } else if (io && !teamId) {
      console.warn('[Activity] Not emitted — no teamId on action:', action);
    }
  } catch (err) {
    console.error('[Activity] Failed to log:', action, err.message);
  }
};
