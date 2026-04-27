import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "./Layout/UserLayout";
import { getMyBookings } from "../../services/bookings";
import { getProfile } from "../../services/user";
import { ROOMS } from "../../data/rooms";

function getRoomName(roomId) {
  return ROOMS.find((r) => r.id === roomId)?.name || `Room #${roomId}`;
}
function getRoomImage(roomId) {
  return ROOMS.find((r) => r.id === roomId)?.image || null;
}
function daysUntil(date) {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const BADGE = {
  confirmed: "ah-badge-confirmed",
  pending:   "ah-badge-pending",
  cancelled: "ah-badge-cancelled",
  completed: "ah-badge-completed",
};

function Skeleton({ h = 20, w = "100%", r = 6 }) {
  return <div className="ah-skeleton" style={{ height: h, width: w, borderRadius: r }} />;
}

export default function Dashboard() {
  const [profile, setProfile]   = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getMyBookings()])
      .then(([p, b]) => { setProfile(p.data); setBookings(b.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const confirmed  = bookings.filter((b) => b.status === "confirmed");
  const pending    = bookings.filter((b) => b.status === "pending");
  const completed  = bookings.filter((b) => b.status === "completed");
  const upcoming   = confirmed.find((b) => new Date(b.check_in) >= new Date());
  const totalSpent = completed.reduce((s, b) => s + Number(b.total_price), 0);
  const firstName  = profile?.full_name?.split(" ")[0] || "there";

  const stats = [
    { icon: "event_available", label: "Confirmed",   sub: "Upcoming stays",  val: confirmed.length,  tone: "#16A34A", bg: "#DCFCE7" },
    { icon: "pending",         label: "Pending",     sub: "Awaiting payment", val: pending.length,   tone: "#D97706", bg: "#FEF3C7" },
    { icon: "history",         label: "Completed",   sub: "Past stays",       val: completed.length, tone: "#1D4ED8", bg: "#DBEAFE" },
    { icon: "paid",            label: "Total spent", sub: "Lifetime",         val: `$${totalSpent.toLocaleString()}`, tone: "#2563EB", bg: "#DBEAFE" },
  ];

  return (
    <UserLayout>
      <div style={{ padding: "0 0 40px" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            {loading
              ? <Skeleton h={13} w={160} />
              : <div className="ah-eyebrow" style={{ marginBottom: 6 }}>Member since {new Date(profile?.created_at || Date.now()).getFullYear()}</div>
            }
            {loading
              ? <div style={{ marginTop: 8 }}><Skeleton h={32} w={280} /></div>
              : <h1 className="ah-h1" style={{ fontSize: 32, marginTop: 6 }}>Welcome back, {firstName}.</h1>
            }
            {loading
              ? <div style={{ marginTop: 8 }}><Skeleton h={14} w={320} /></div>
              : upcoming
                ? <p className="ah-muted" style={{ fontSize: 14, marginTop: 6 }}>Your next stay is in {daysUntil(upcoming.check_in)} days. We'll have everything ready.</p>
                : <p className="ah-muted" style={{ fontSize: 14, marginTop: 6 }}>No upcoming stays. Ready to plan your next getaway?</p>
            }
          </div>
          <Link to="/rooms" className="ah-btn ah-btn-primary" style={{ flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> New booking
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="ah-stat">
                  <Skeleton h={44} w={44} r={10} />
                  <div style={{ marginTop: 14 }}><Skeleton h={26} w={60} /></div>
                  <div style={{ marginTop: 6 }}><Skeleton h={13} w={120} /></div>
                </div>
              ))
            : stats.map((s) => (
                <div key={s.label} className="ah-stat">
                  <div className="ah-stat-icon" style={{ color: s.tone, background: s.bg }}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div className="ah-stat-val">{s.val}</div>
                  <div className="ah-stat-lbl">{s.label} · {s.sub}</div>
                </div>
              ))
          }
        </div>

        {/* ── Main two-column ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          {/* Recent bookings table */}
          <div className="ah-card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
              <h3 className="ah-h3">Recent bookings</h3>
              <Link to="/my-bookings" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>View all</Link>
            </div>
            {loading ? (
              <div style={{ padding: 24 }}>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                    <Skeleton h={14} w={130} />
                    <Skeleton h={14} w={120} />
                    <Skeleton h={14} w={100} />
                    <Skeleton h={14} w={60} />
                    <Skeleton h={22} w={80} r={99} />
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>book_online</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>No bookings yet</p>
                <p className="ah-muted" style={{ fontSize: 13, marginTop: 4 }}>Your booking history will appear here.</p>
                <Link to="/rooms" className="ah-btn ah-btn-primary ah-btn-sm" style={{ marginTop: 14, display: "inline-flex" }}>Browse rooms</Link>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                    {["Reference", "Dates", "Room", "Total", "Status"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b, i) => (
                    <tr key={b.id} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                      <td style={{ padding: "14px 20px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600 }}>#{b.id}</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600 }}>{b.check_in} → {b.check_out}</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, maxWidth: 140 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getRoomName(b.room_id)}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700 }}>${Number(b.total_price).toLocaleString()}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`ah-badge ${BADGE[b.status] || "ah-badge-completed"}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Next stay card */}
            <div className="ah-card" style={{ overflow: "hidden" }}>
              {upcoming ? (
                <>
                  <div style={{ height: 96, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {getRoomImage(upcoming.room_id) ? (
                      <img src={getRoomImage(upcoming.room_id)} alt="Room" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
                    ) : null}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(15,23,42,.2),rgba(15,23,42,.6))" }} />
                    <span style={{ position: "relative", color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>next stay</span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div className="ah-eyebrow">In {daysUntil(upcoming.check_in)} days</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{getRoomName(upcoming.room_id)}</div>
                    <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>{upcoming.check_in} → {upcoming.check_out}</div>
                    <Link to={`/my-bookings/${upcoming.id}`} className="ah-btn ah-btn-secondary ah-btn-block ah-btn-sm" style={{ marginTop: 12 }}>View itinerary</Link>
                  </div>
                </>
              ) : (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>hotel</span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>No upcoming stays</p>
                  <p className="ah-muted" style={{ fontSize: 12, marginTop: 4 }}>Plan your next getaway.</p>
                  <Link to="/rooms" className="ah-btn ah-btn-primary ah-btn-block ah-btn-sm" style={{ marginTop: 12 }}>Browse rooms</Link>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="ah-card" style={{ padding: 18 }}>
              <h3 className="ah-h3" style={{ marginBottom: 12 }}>Quick actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { icon: "book_online", label: "My bookings",   to: "/my-bookings" },
                  { icon: "star",        label: "My reviews",    to: "/reviews" },
                  { icon: "credit_card", label: "Payment history", to: "/payments" },
                  { icon: "notifications", label: "Notifications", to: "/notifications" },
                ].map(({ icon, label, to }) => (
                  <Link key={to} to={to} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "var(--text)", textDecoration: "none", transition: "background .15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--text-secondary)" }}>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-tertiary)" }}>chevron_right</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
