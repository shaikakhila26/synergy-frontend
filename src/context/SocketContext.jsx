// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('[SocketContext] connecting to BACKEND:', BACKEND);
    const s = io(BACKEND, { 
      path: '/socket.io/',
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      timeout: 45000,
      forceNew: true,
      withCredentials: true,
      autoConnect: true,
      rememberUpgrade: true,
      secure: true,
      rejectUnauthorized: false
    });

    s.on('connect', () => {
      console.log('[Socket] Connected! ID:', s.id);
    });

    s.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    s.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
