import { useNotifications } from '../../contexts/NotificationContext';

export default function Toast() {
  const { toasts, dismiss } = useNotifications();
  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          style={{
            background: '#1e1e3f', color: '#f0f0ff', padding: '14px 18px',
            borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
            minWidth: 280, maxWidth: 360, borderLeft: '4px solid #6366f1',
            cursor: 'pointer', animation: 'slideIn 0.3s ease',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {t.event === 'booking_update' ? 'Booking Update' : t.title || 'Notification'}
          </div>
          {t.message && (
            <div style={{ fontSize: 13, opacity: 0.85 }}>{t.message}</div>
          )}
          {t.status && (
            <div style={{ fontSize: 13, opacity: 0.85 }}>Status: <b>{t.status}</b></div>
          )}
        </div>
      ))}
    </div>
  );
}
