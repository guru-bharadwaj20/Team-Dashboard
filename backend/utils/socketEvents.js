// Event names and label tables come from the shared contract, so the server and
// the SPA cannot drift apart. Re-exported here so existing imports keep working.
export { SOCKET_EVENTS, ACTIVITY_ACTIONS, ACTIVITY_LABELS } from '../../shared/events.js';

// ─── Emitters ────────────────────────────────────────────────────────────────

export const emitToTeam = (io, teamId, event, data) =>
  io.to(`team:${teamId}`).emit(event, data);

export const emitToProposal = (io, proposalId, event, data) =>
  io.to(`proposal:${proposalId}`).emit(event, data);

export const emitToUser = (io, userId, event, data) =>
  io.to(`user:${userId}`).emit(event, data);

export const emitBroadcast = (io, event, data) =>
  io.emit(event, data);
