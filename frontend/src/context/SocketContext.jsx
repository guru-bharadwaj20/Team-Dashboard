import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAuthToken } from '../utils/helpers.js';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // If socket already exists, don't create a new one
    if (socketRef.current) {
      console.log('Socket already exists, reusing...');
      return;
    }

    const token = getAuthToken();
    if (!token) return; // Don't connect if not authenticated

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const SOCKET_URL = API_URL.replace('/api', ''); // Remove /api for socket connection

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      pingInterval: 25000,
      pingTimeout: 60000,
      forceNew: false,
      multiplex: true,
    });

    socketInstance.on('connect', () => {
      console.log('✓ Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('✗ Socket disconnected:', reason);
      setConnected(false);
      
      // Automatic reconnection will handle most cases
      if (reason === 'io server disconnect') {
        // Server forced disconnect, attempt reconnect
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('✓ Socket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('↻ Attempting to reconnect...', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('✗ Failed to reconnect');
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount - only cleanup on full unload
      // This prevents unnecessary disconnections during navigation
      console.log('⚠️  Component unmounting (socket persisting)');
    };
  }, []);

  const joinTeam = (teamId) => {
    if (socket && connected) {
      socket.emit('join-team', teamId);
    }
  };

  const leaveTeam = (teamId) => {
    if (socket && connected) {
      socket.emit('leave-team', teamId);
    }
  };

  const joinProposal = (proposalId) => {
    if (socket && connected) {
      socket.emit('join-proposal', proposalId);
    }
  };

  const leaveProposal = (proposalId) => {
    if (socket && connected) {
      socket.emit('leave-proposal', proposalId);
    }
  };

  const value = {
    socket,
    connected,
    joinTeam,
    leaveTeam,
    joinProposal,
    leaveProposal,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
