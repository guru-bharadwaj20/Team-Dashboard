import { io } from 'socket.io-client';
import { getAuthToken } from './helpers.js';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  const token = getAuthToken();
  if (!token) return null;

  const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5001';

  socket = io(WEBSOCKET_URL, {
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinTeam = (teamId) => {
  if (socket) {
    socket.emit('join-team', teamId);
  }
};

export const emitProposalUpdate = (data) => {
  if (socket) {
    socket.emit('proposal-updated', data);
  }
};

export const emitVote = (data) => {
  if (socket) {
    socket.emit('vote-cast', data);
  }
};

export const emitComment = (data) => {
  if (socket) {
    socket.emit('comment-added', data);
  }
};

export const onProposalChange = (callback) => {
  if (socket) {
    socket.on('proposal-changed', callback);
  }
};

export const onVoteReceived = (callback) => {
  if (socket) {
    socket.on('vote-received', callback);
  }
};

export const onNewComment = (callback) => {
  if (socket) {
    socket.on('new-comment', callback);
  }
};

export const onUserJoined = (callback) => {
  if (socket) {
    socket.on('user-joined', callback);
  }
};
