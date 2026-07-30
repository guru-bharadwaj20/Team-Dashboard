import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js';
import { SocketContext } from './contexts.js';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Keyed on the signed-in user, so signing in connects and signing out tears
  // down. The previous version read the token once on mount with an empty
  // dependency list, which meant real-time stayed dead for the whole first
  // session after login until the page was reloaded.
  useEffect(() => {
    // No session: nothing to connect. State was already reset by the previous
    // run's cleanup, so there is no setState to do here.
    if (!userId) return;

    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

    const s = io(SOCKET_URL, {
      // The handshake authenticates from the httpOnly auth cookie, which the
      // browser only attaches when credentials are enabled.
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    // The personal notification room is joined server-side from the verified JWT.
    s.on('connect', () => setConnected(true));

    s.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') s.connect();
    });

    s.on('connect_error', () => setConnected(false));
    s.on('reconnect', () => setConnected(true));

    socketRef.current = s;
    // Publishing the socket instance is the point of this effect: it is the handle
    // to an external system that consumers subscribe to and must re-render for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s);

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [userId]);

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
