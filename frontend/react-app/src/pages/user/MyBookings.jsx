import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "./Layout/UserLayout";
import { getMyBookings, cancelBooking } from "../../services/bookings";
import { ROOMS } from "../../data/rooms";

const TABS = [
  { key: "all",       label: "All" },
  { key: "confirmed", label: "Upcoming" },
  { key: "pending",   label: "Pending" },
  { key: "completed", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const BADGE = {
  confirmed: "ah-badge-confirmed",
  pending:   "ah-badge-pending",
  cancelled: "ah-badge-cancelled",
  completed: "ah-badge-completed",
};

const BADGE_LABEL = {
  confirmed: "Confirmed",
  pending:   "Pending payment",
  cancelled: "Cancelled",
  completed: "Completed",
};

function getRoomInfo(roomId) {
  const r = ROOMS.find((x) => x.id === roomId);
  return { name: r?.name || `Room #${roomId}`, image: r?.image || null };
}

export default function MyBookings() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("all");
  const [flipped, setFlipped]     = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    getMyBookings()
      .then((r) => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    all:       bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  async function handleCancel(id) {
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      setFlipped(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to cancel. Please try again.");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <UserLayout>
      <div>
        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="ah-h1" style={{ fontSize: 32 }}>My bookings</h1>
        </div>

        {/* ── Tabs ── */}
        <div className="ah-tabs" style={{ marginBottom: 24 }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setFlipped(null); }}
              className={`ah-tab ${tab === key ? "is-active" : ""}`}
              style={{ background: "none", border: "none" }}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="ah-card" style={{ height: 140 }}>
                <div className="ah-skeleton" style={{ height: "100%", borderRadius: 12 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ah-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 28 }}>book_online</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>No {tab === "all" ? "" : BADGE_LABEL[tab]?.toLowerCase()} bookings</p>
            <p className="ah-muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 16 }}>Your bookings will appear here.</p>
            <Link to="/hotels" className="ah-btn ah-btn-primary ah-btn-sm">Browse rooms</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((b) => {
              const { name, image } = getRoomInfo(b.room_id);
              const isFlipped = flipped === b.id;
              const nights = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / 86400000);

              return (
                <div key={b.id} className="ah-flip" style={{ minHeight: 172 }}>
                  <div className="ah-flip-inner" style={isFlipped ? { transform: "rotateY(180deg)" } : {}}>
                    {/* Front */}
                    <div className="ah-flip-front ah-card grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] items-center" style={{ gap: 20, padding: 16 }}>
                      {/* Image */}
                      <div style={{ borderRadius: 10, overflow: "hidden", height: 140, background: "linear-gradient(135deg,#dbeafe,#eff6ff)", flexShrink: 0 }}>
                        {image ? (
                          <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--primary)", opacity: 0.4 }}>hotel</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <span className={`ah-badge ${BADGE[b.status] || "ah-badge-completed"}`}>{BADGE_LABEL[b.status] || b.status}</span>
                        <h3 className="ah-h3" style={{ marginTop: 10 }}>{name}</h3>
                        <div className="ah-muted" style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>
                          {b.check_in} → {b.check_out} · {nights} night{nights !== 1 ? "s" : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "JetBrains Mono, monospace", marginTop: 6 }}>#{b.id}</div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
                          ${Number(b.total_price).toLocaleString()}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link to={`/my-bookings/${b.id}`} className="ah-btn ah-btn-secondary ah-btn-sm">View</Link>
                          {b.status === "confirmed" || b.status === "pending" ? (
                            <button
                              onClick={() => setFlipped(b.id)}
                              className="ah-btn ah-btn-ghost ah-btn-sm"
                              style={{ color: "var(--error)" }}
                            >Cancel</button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Back — cancel confirmation */}
                    <div className="ah-flip-back">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--warning-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ color: "var(--warning)" }}>warning</span>
                        </div>
                        <h3 className="ah-h3">Cancel this booking?</h3>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.55 }}>
                        Are you sure you want to cancel <strong>{name}</strong> ({b.check_in} → {b.check_out})?
                        This action may be subject to cancellation fees per our policy.
                      </p>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                        <button className="ah-btn ah-btn-ghost ah-btn-sm" onClick={() => setFlipped(null)}>Keep booking</button>
                        <button
                          className="ah-btn ah-btn-danger ah-btn-sm"
                          disabled={cancelling === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          {cancelling === b.id ? "Cancelling…" : "Yes, cancel"}
                        </button>
                      </div>
                    </div>
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
