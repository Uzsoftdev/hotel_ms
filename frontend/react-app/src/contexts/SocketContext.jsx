import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

function getWsBase() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}`;
}

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!token || !user?.user_id) return;

    const url = `${getWsBase()}/ws/${user.user_id}?token=${token}`;
    let active = true;

    function connect() {
      if (!active) return;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event !== 'pong') setLastMessage(msg);
        } catch {}
      };

      ws.onclose = () => {
        if (active) reconnectRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [token, user?.user_id]);

  return (
    <SocketContext.Provider value={{ lastMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketContext;
