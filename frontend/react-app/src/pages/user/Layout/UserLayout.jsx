import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import UserProfileMenu from "../../../components/common/UserProfileMenu";

const navItems = [
  { to: "/dashboard",     icon: "dashboard",     label: "Dashboard" },
  { to: "/my-bookings",   icon: "book_online",   label: "My Bookings" },
{ to: "/notifications", icon: "notifications", label: "Notifications" },
  { to: "/profile",       icon: "person",        label: "Profile" },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-60 shrink-0
        bg-white border-r border-[var(--border)] flex flex-col
        transition-transform duration-300
        lg:static lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Logo */}
        <div style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--border)" }}>
          <Link to="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#2563EB", fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#0f172a" }}>all</span><span style={{ color: "#2563EB" }}>Stay</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded text-gray-400 hover:bg-gray-100">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
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

        {/* Browse CTA */}
        <div style={{ padding: "12px 10px 20px" }}>
          <Link to="/hotels" onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
            Browse hotels
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 68, background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", gap: 12 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="hidden lg:block" />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/hotels"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
              className="hidden sm:inline-flex"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New booking
            </Link>
            <UserProfileMenu />
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "16px" }} className="md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
