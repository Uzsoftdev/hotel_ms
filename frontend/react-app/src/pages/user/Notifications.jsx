import { useEffect, useState } from "react";
import UserLayout from "./Layout/UserLayout";
import { getNotifications, markNotificationRead, markAllRead } from "../../services/user";

const TONE_MAP = {
  success: { bg: "var(--success-bg)", fg: "var(--success)",  icon: "check_circle" },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning)",  icon: "local_offer" },
  error:   { bg: "var(--error-bg)",   fg: "var(--error)",    icon: "error" },
  info:    { bg: "var(--primary-light)", fg: "var(--primary)", icon: "info" },
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((r) => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  async function handleRead(id) {
    try {
      const r = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? r.data : n)));
    } catch {}
  }

  async function handleReadAll() {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 className="ah-h1" style={{ fontSize: 32 }}>Notifications</h1>
            {unread > 0 && <p className="ah-muted" style={{ fontSize: 13, marginTop: 4 }}>{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button className="ah-btn ah-btn-ghost ah-btn-sm" onClick={handleReadAll}>Mark all as read</button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="ah-card" style={{ overflow: "hidden" }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: 18, borderTop: i ? "1px solid var(--border)" : "none" }}>
                <div className="ah-skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="ah-skeleton" style={{ height: 14, width: "70%" }} />
                  <div className="ah-skeleton" style={{ height: 12, width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="ah-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 28 }}>notifications_none</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>You're all caught up!</p>
            <p className="ah-muted" style={{ fontSize: 13, marginTop: 6 }}>No notifications at this time.</p>
          </div>
        ) : (
          <div className="ah-card" style={{ overflow: "hidden" }}>
            {notifications.map((n, i) => {
              const tone = TONE_MAP[n.type] || TONE_MAP.info;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleRead(n.id)}
                  style={{
                    display: "flex", gap: 14, padding: 18,
                    borderTop: i ? "1px solid var(--border)" : "none",
                    background: n.is_read ? "#fff" : "rgba(37,99,235,.03)",
                    cursor: n.is_read ? "default" : "pointer",
                    transition: "background .15s",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: tone.bg, color: tone.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{tone.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      {n.title}
                      {!n.is_read && <span style={{ width: 8, height: 8, background: "var(--primary)", borderRadius: "50%", flexShrink: 0 }} />}
                    </div>
                    <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>{n.message}</div>
                  </div>
                  <div className="ah-muted" style={{ fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {n.created_at ? relativeTime(n.created_at) : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
