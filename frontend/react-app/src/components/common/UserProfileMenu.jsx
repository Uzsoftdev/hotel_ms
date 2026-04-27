import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const ROLE_COLORS = {
  super_admin: "bg-rose-500",
  hotel_admin: "bg-violet-500",
  staff: "bg-blue-500",
  guest: "bg-primary",
};

const ROLE_LABEL = {
  super_admin: "Super Admin",
  hotel_admin: "Hotel Admin",
  staff: "Staff",
  guest: "Guest",
};

// Per-role menu items: { label, icon, to }
const MENU_ITEMS = {
  super_admin: [
    { label: "My Profile", icon: "manage_accounts", to: "/admin/profile" },
    { label: "Settings", icon: "settings", to: "/admin/settings" },
    { label: "Activity Logs", icon: "history", to: "/admin/activity-logs" },
  ],
  hotel_admin: [
    { label: "My Profile", icon: "manage_accounts", to: "/admin/profile" },
    { label: "Settings", icon: "settings", to: "/admin/settings" },
  ],
  staff: [
    { label: "My Profile", icon: "manage_accounts", to: "/staff/profile" },
    { label: "Settings", icon: "settings", to: "/staff/settings" },
  ],
  guest: [
    { label: "My Profile", icon: "manage_accounts", to: "/profile" },
    { label: "My Bookings", icon: "book_online", to: "/my-bookings" },
    { label: "Notifications", icon: "notifications", to: "/notifications" },
    { label: "Settings", icon: "settings", to: "/settings" },
  ],
};

export default function UserProfileMenu() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const role = user?.role ?? "guest";
  const initials = getInitials(user?.full_name ?? user?.email ?? "");
  const avatarBg = ROLE_COLORS[role] ?? "bg-primary";
  const menuItems = MENU_ITEMS[role] ?? MENU_ITEMS.guest;
  const photoUrl = user?.photo_url ? `http://localhost:8000${user.photo_url}` : null;

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-9 h-9 rounded-full ${photoUrl ? "" : avatarBg} flex items-center justify-center text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity ring-2 ring-white/40 focus:outline-none overflow-hidden`}
        aria-label="User menu"
      >
        {photoUrl ? <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" /> : initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-bright border border-outline-variant/30 shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${photoUrl ? "" : avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden`}>
              {photoUrl ? <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">
                {user?.full_name ?? "User"}
              </p>
              <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
              <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${avatarBg}/10 text-on-surface-variant`}>
                {ROLE_LABEL[role] ?? role}
              </span>
            </div>
          </div>

          {/* Nav items */}
          <div className="py-1">
            {menuItems.map(({ label, icon, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* Divider + theme toggle */}
          <div className="border-t border-outline-variant/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-outline-variant/20 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
