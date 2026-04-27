import { Link, NavLink, useNavigate } from "react-router-dom";
import UserProfileMenu from "../../../components/common/UserProfileMenu";

const navItems = [
  { to: "/staff/bookings", icon: "book_online", label: "Assigned Bookings" },
  { to: "/staff/checkinout", icon: "swap_horiz", label: "Check-In / Out" },
  { to: "/staff/rooms", icon: "bed", label: "Room Status" },
  { to: "/staff/tasks", icon: "task_alt", label: "Tasks" },
  { to: "/staff/daily-summary", icon: "summarize", label: "Daily Summary" },
  { to: "/staff/guest-requests", icon: "support_agent", label: "Guest Requests" },
];

export default function StaffLayout({ children }) {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <aside className="w-64 shrink-0 bg-surface-bright border-r border-outline-variant/30 flex flex-col overflow-y-auto">
        <div className="h-16 flex items-center px-5 border-b border-outline-variant/30 gap-2.5">
          <Link to="/staff/bookings" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span className="text-base font-extrabold tracking-tight"><span className="text-slate-900">Azure </span><span className="text-primary">Horizon</span></span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Staff</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface-bright border-b border-outline-variant/30 flex items-center justify-between px-8">
          <div />
          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>View Site
            </Link>
            <UserProfileMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
