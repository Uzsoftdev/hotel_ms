import { Link, NavLink } from "react-router-dom";
import UserProfileMenu from "../../../components/common/UserProfileMenu";

const navItems = [
  { to: "/dashboard",      icon: "dashboard",      label: "Dashboard" },
  { to: "/my-bookings",    icon: "book_online",     label: "My Bookings" },
  { to: "/payments",       icon: "receipt_long",    label: "Payments" },
  { to: "/reviews",        icon: "star",            label: "Reviews" },
  { to: "/notifications",  icon: "notifications",   label: "Notifications" },
  { to: "/profile",        icon: "person",          label: "Profile" },
];

export default function UserLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: 240, flexShrink: 0, background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ height: 68, display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid var(--border)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#2563EB", fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#0f172a" }}>Azure </span><span style={{ color: "#2563EB" }}>Horizon</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                transition: "all .15s",
                background: isActive ? "var(--primary-light)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
              })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Browse rooms CTA */}
        <div style={{ padding: "12px 10px 20px" }}>
          <Link
            to="/rooms"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
            Browse rooms
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{ height: 68, background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 28px", gap: 12 }}>
          <Link
            to="/rooms"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            New booking
          </Link>
          <NavLink to="/notifications" style={{ position: "relative", padding: 8, borderRadius: 8, color: "var(--text-secondary)", display: "flex" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span className="material-symbols-outlined">notifications</span>
          </NavLink>
          <UserProfileMenu />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: "auto", padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
