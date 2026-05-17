import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const socket = useSocket();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!socket?.lastMessage) return;
    const { event, data } = socket.lastMessage;
    if (event === 'connected') return;

    const toast = { id: Date.now(), event, ...data };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 4500);
  }, [socket?.lastMessage]);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <NotificationContext.Provider value={{ toasts, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  return ctx ?? { toasts: [], dismiss: () => {} };
}

export default NotificationContext;
