import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', user._id);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('request:new', (payload) => {
      toast(`New service request for "${payload.serviceTitle}"`, { icon: '📩' });
    });

    socket.on('request:statusUpdated', (payload) => {
      toast(`Project status updated: ${payload.status}`, { icon: '🔄' });
    });

    return () => socket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
