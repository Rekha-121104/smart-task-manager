import { useEffect, useRef } from 'react';
import { initSocket, disconnectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const { fetchTasks } = useTask();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = initSocket(token);
    socketRef.current = socket;

    socket.on('task:created', () => fetchTasks());
    socket.on('task:updated', () => fetchTasks());
    socket.on('task:deleted', () => fetchTasks());

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, token]);

  return socketRef.current;
};
