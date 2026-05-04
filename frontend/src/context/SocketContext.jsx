import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = sessionStorage.getItem('accessToken');
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

      // Initialize socket connection
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);

        // If authentication failed (e.g., token invalid or DB disconnected during verification)
        if (error.message && error.message.includes('Authentication error')) {
          newSocket.close();
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('user');
          window.location.href = '/';
        }
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  const joinProject = useCallback((projectId) => {
    if (socket && connected) {
      socket.emit('project:join', projectId);
    }
  }, [socket, connected]);

  const leaveProject = useCallback((projectId) => {
    if (socket && connected) {
      socket.emit('project:leave', projectId);
    }
  }, [socket, connected]);

  const joinWorkspace = useCallback((workspaceId) => {
    if (socket && connected) {
      socket.emit('workspace:join', workspaceId);
    }
  }, [socket, connected]);

  const leaveWorkspace = useCallback((workspaceId) => {
    if (socket && connected) {
      socket.emit('workspace:leave', workspaceId);
    }
  }, [socket, connected]);

  const emitTaskViewing = useCallback((taskId, projectId) => {
    if (socket && connected) {
      socket.emit('task:viewing', { taskId, projectId });
    }
  }, [socket, connected]);

  const emitTaskStopViewing = useCallback((taskId, projectId) => {
    if (socket && connected) {
      socket.emit('task:stop-viewing', { taskId, projectId });
    }
  }, [socket, connected]);

  const onTaskUpdate = useCallback((callback) => {
    if (socket) {
      socket.on('task:updated', callback);
      return () => socket.off('task:updated', callback);
    }
  }, [socket]);

  const onCommentAdded = useCallback((callback) => {
    if (socket) {
      socket.on('comment:added', callback);
      return () => socket.off('comment:added', callback);
    }
  }, [socket]);

  const onPresenceUpdate = useCallback((callback) => {
    if (socket) {
      socket.on('task:user-viewing', (data) => callback({ ...data, type: 'viewing' }));
      socket.on('task:user-stop-viewing', (data) => callback({ ...data, type: 'stop-viewing' }));
      return () => {
        socket.off('task:user-viewing');
        socket.off('task:user-stop-viewing');
      };
    }
  }, [socket]);

  const value = {
    socket,
    connected,
    joinProject,
    leaveProject,
    joinWorkspace,
    leaveWorkspace,
    emitTaskViewing,
    emitTaskStopViewing,
    onTaskUpdate,
    onCommentAdded,
    onPresenceUpdate,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};