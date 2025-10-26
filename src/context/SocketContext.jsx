// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('[SocketContext] connecting to BACKEND:', BACKEND);
    const s = io(BACKEND, { transports: ['websocket', 'polling'] });
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
