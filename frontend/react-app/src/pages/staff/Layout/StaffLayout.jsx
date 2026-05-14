import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import UserProfileMenu from "../../../components/common/UserProfileMenu";

const navItems = [
  { to: "/staff/bookings",      icon: "book_online",   label: "Assigned Bookings" },
  { to: "/staff/checkinout",    icon: "swap_horiz",    label: "Check-In / Out" },
  { to: "/staff/rooms",         icon: "bed",           label: "Room Status" },
  { to: "/staff/tasks",         icon: "task_alt",      label: "Tasks" },
  { to: "/staff/daily-summary", icon: "summarize",     label: "Daily Summary" },
  { to: "/staff/guest-requests",icon: "support_agent", label: "Guest Requests" },
];

export default function StaffLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 shrink-0
        bg-surface-bright border-r border-outline-variant/30
        flex flex-col overflow-y-auto transition-transform duration-300
        lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-outline-variant/30">
          <Link to="/staff/bookings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span className="text-base font-extrabold tracking-tight">
              <span className="text-slate-900 dark:text-white">all</span><span className="text-primary">Stay</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Staff</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded text-on-surface-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`
              }>
              <span className="material-symbols-outlined text-[18px]">{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4 border-t border-outline-variant/30 pt-3">
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined text-[18px]">logout</span>Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-surface-bright border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/" target="_blank" className="hidden sm:flex text-sm font-semibold text-on-surface-variant hover:text-primary transition-all items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>View Site
            </Link>
            <UserProfileMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
