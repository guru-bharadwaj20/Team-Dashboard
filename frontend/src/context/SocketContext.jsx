import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAuthToken, getCurrentUser } from '../utils/helpers.js';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    // Prevent duplicate connections
    if (socketRef.current?.connected) return;

    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const currentUser = getCurrentUser();

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      setConnected(true);
      // Join personal room for targeted notifications
      if (currentUser?.id) s.emit('join-user', currentUser.id);
    });

    s.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') s.connect();
    });

    s.on('connect_error', () => setConnected(false));
    s.on('reconnect', () => setConnected(true));

    setSocket(s);
    socketRef.current = s;

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinTeam = useCallback((teamId) => {
    socketRef.current?.emit('join-team', teamId);
  }, []);

  const leaveTeam = useCallback((teamId) => {
    socketRef.current?.emit('leave-team', teamId);
  }, []);

  const joinProposal = useCallback((proposalId) => {
    socketRef.current?.emit('join-proposal', proposalId);
  }, []);

  const leaveProposal = useCallback((proposalId) => {
    socketRef.current?.emit('leave-proposal', proposalId);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, joinTeam, leaveTeam, joinProposal, leaveProposal }}>
      {children}
    </SocketContext.Provider>
  );
};
