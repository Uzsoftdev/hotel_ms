import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { getOccupancyReport, getRevenueReport, getAllBookings, getUsers, getHotels } from "../../services/admin";

const ROLE_COLORS = {
  super_admin: "bg-red-100 text-red-700",
  hotel_admin: "bg-orange-100 text-orange-700",
  staff: "bg-blue-100 text-blue-700",
  guest: "bg-green-100 text-green-700",
};

const PERIOD_OPTIONS = [
  { label: "Today", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return isNaN(diff) || diff < 0 ? "—" : diff;
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState(30);
  const [occupancy, setOccupancy] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Fetch reports when period changes
  useEffect(() => {
    setReportsLoading(true);
    Promise.allSettled([
      getOccupancyReport(period),
      getRevenueReport(period),
    ]).then(([o, r]) => {
      if (o.status === "fulfilled") setOccupancy(o.value.data);
      if (r.status === "fulfilled") setRevenue(r.value.data);
    }).finally(() => setReportsLoading(false));
  }, [period]);

  // Fetch static data once
  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getAllBookings(),
      getUsers(),
      getHotels(),
    ]).then(([b, u, h]) => {
      if (b.status === "fulfilled") {
        const bData = b.value.data;
        const bList = Array.isArray(bData) ? bData : (bData?.items ?? bData?.data ?? []);
        setAllBookings(bList);
      }
      if (u.status === "fulfilled") {
        const uData = u.value.data;
        setUsers(Array.isArray(uData) ? uData : (uData?.items ?? uData?.data ?? []));
      }
      if (h.status === "fulfilled") {
        const hData = h.value.data;
        setHotels(Array.isArray(hData) ? hData : (hData?.items ?? hData?.data ?? []));
      }
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const arrivalsToday = allBookings.filter(
    (b) => b.check_in === today && (b.status === "confirmed" || b.status === "pending")
  );
  const departuresToday = allBookings.filter(
    (b) => b.check_out === today && (b.status === "confirmed" || b.status === "completed")
  );
  const pendingCount = allBookings.filter((b) => b.status === "pending").length;

  const recentBookings = allBookings.slice(0, 5);

  const statusCounts = allBookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const totalBookings = allBookings.length;

  const kpis = [
    { icon: "hotel", label: "Total Hotels", value: hotels.length, color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: "bed", label: "Total Rooms", value: occupancy?.total_rooms ?? "—", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: "group", label: "Registered Users", value: users.length, color: "text-teal-600", bg: "bg-teal-50" },
    { icon: "book_online", label: `Bookings (${PERIOD_OPTIONS.find(p => p.days === period)?.label})`, value: occupancy?.total_bookings ?? "—", color: "text-green-600", bg: "bg-green-50" },
    { icon: "percent", label: "Occupancy Rate", value: occupancy ? `${occupancy.occupancy_rate_pct}%` : "—", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: "attach_money", label: `Revenue (${PERIOD_OPTIONS.find(p => p.days === period)?.label})`, value: revenue ? `$${Number(revenue.total_revenue).toLocaleString()}` : "—", color: "text-primary", bg: "bg-primary/5" },
  ];

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const dailyRevenue = revenue?.daily_revenue ?? [];
  const last14Revenue = dailyRevenue.slice(-14);
  const maxRevenue = Math.max(...last14Revenue.map((d) => Number(d.revenue ?? d.total ?? 0)), 1);

  const statusBarConfig = [
    { key: "pending", label: "Pending", color: "bg-amber-400" },
    { key: "confirmed", label: "Confirmed", color: "bg-green-500" },
    { key: "completed", label: "Completed", color: "bg-blue-500" },
    { key: "cancelled", label: "Cancelled", color: "bg-red-400" },
  ];

  const quickActions = [
    { label: "Add Room", to: "/admin/rooms/add", icon: "add_home" },
    { label: "Add User", to: "/admin/users/add", icon: "person_add" },
    { label: "Manage Pricing", to: "/admin/pricing", icon: "sell" },
    { label: "View Reports", to: "/admin/reports/occupancy", icon: "analytics" },
    { label: "Check-In/Out", to: "/admin/checkinout", icon: "swap_horiz" },
    { label: "Activity Logs", to: "/admin/activity-logs", icon: "history" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header + period selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-on-surface-variant mt-1">Overview and live stats</p>
          </div>
          <div className="flex gap-1 bg-surface-container rounded-xl p-1 self-start sm:self-auto">
            {PERIOD_OPTIONS.map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === days
                    ? "bg-white shadow text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : (
          <>
            {/* Today's Live Stats banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border-l-4 border-indigo-500 border border-outline-variant/30 px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>flight_land</span>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-indigo-700">{arrivalsToday.length}</p>
                  <p className="text-xs text-on-surface-variant">Arrivals Today</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border-l-4 border-teal-500 border border-outline-variant/30 px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-teal-600" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-teal-700">{departuresToday.length}</p>
                  <p className="text-xs text-on-surface-variant">Departures Today</p>
                </div>
              </div>
              <Link
                to="/admin/bookings"
                className="bg-white rounded-xl border-l-4 border-amber-400 border border-outline-variant/30 px-5 py-4 flex items-center gap-4 hover:bg-amber-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-extrabold text-amber-700">{pendingCount}</p>
                  <p className="text-xs text-on-surface-variant">Pending Approvals</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {/* KPI cards */}
            {reportsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map(({ label }) => (
                  <div key={label} className="bg-white rounded-xl p-5 border border-outline-variant/30 animate-pulse">
                    <div className="w-10 h-10 bg-surface-container rounded-xl mb-3" />
                    <div className="h-6 bg-surface-container rounded w-16 mb-1" />
                    <div className="h-3 bg-surface-container rounded w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map(({ icon, label, value, color, bg }) => (
                  <div key={label} className="bg-white rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-2xl font-extrabold">{value}</p>
                        <span className="material-symbols-outlined text-green-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-tight">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Revenue bar chart + Booking status distribution */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue bar chart */}
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Daily Revenue (Last {Math.min(14, last14Revenue.length)} days)</h2>
                </div>
                <div className="p-6 overflow-x-auto">
                  {last14Revenue.length === 0 ? (
                    <div className="py-8 text-center text-on-surface-variant text-sm">No revenue data available</div>
                  ) : (
                    <div className="min-w-[320px]">
                      <div className="flex items-end gap-1" style={{ height: 160 }}>
                        {last14Revenue.map((d) => {
                          const val = Number(d.revenue ?? d.total ?? 0);
                          const pct = maxRevenue > 0 ? (val / maxRevenue) * 100 : 0;
                          return (
                            <div key={d.date} className="flex flex-col items-center flex-1 min-w-0 group relative" style={{ height: "100%" }}>
                              <div className="flex-1 flex items-end w-full">
                                <div
                                  className="w-full bg-primary/20 group-hover:bg-primary rounded-t transition-all duration-300 relative"
                                  style={{ height: `${Math.max(pct, 2)}%` }}
                                >
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    ${val.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {last14Revenue.map((d) => (
                          <div key={d.date} className="flex-1 min-w-0 overflow-hidden">
                            <span
                              className="block text-center text-on-surface-variant"
                              style={{
                                fontSize: 9,
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxHeight: 40,
                              }}
                            >
                              {d.date ? d.date.slice(5) : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking status distribution */}
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Booking Status Distribution</h2>
                </div>
                <div className="p-6 space-y-4">
                  {totalBookings === 0 ? (
                    <div className="py-8 text-center text-on-surface-variant text-sm">No bookings yet</div>
                  ) : (
                    <>
                      <div className="flex rounded-full overflow-hidden h-5" style={{ minWidth: 0 }}>
                        {statusBarConfig.map(({ key, color }) => {
                          const count = statusCounts[key] || 0;
                          if (count === 0) return null;
                          const pct = (count / totalBookings) * 100;
                          return (
                            <div
                              key={key}
                              className={`${color} flex items-center justify-center transition-all`}
                              style={{ width: `${pct}%`, minWidth: count > 0 ? 20 : 0 }}
                              title={`${key}: ${count}`}
                            >
                              <span className="text-white text-[9px] font-bold px-0.5 truncate">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {statusBarConfig.map(({ key, label, color }) => {
                          const count = statusCounts[key] || 0;
                          return (
                            <div key={key} className="flex items-center gap-1.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                              <span className="text-xs text-on-surface-variant capitalize">{label}</span>
                              <span className="text-xs font-bold">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {statusBarConfig.map(({ key, label, color }) => {
                          const count = statusCounts[key] || 0;
                          const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
                          return (
                            <div key={key} className="bg-surface-container-low rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-on-surface-variant capitalize">{label}</span>
                                <span className="text-xs font-bold">{pct}%</span>
                              </div>
                              <div className="mt-1 h-1 bg-surface-container rounded-full">
                                <div className={`${color} h-1 rounded-full`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-outline-variant/30">
              <div className="px-6 py-4 border-b border-outline-variant/20">
                <h2 className="font-extrabold">Quick Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                {quickActions.map(({ label, to, icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/30 hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Hotels performance mini-table + Recent Bookings */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Hotels table */}
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Hotels Performance</h2>
                  <Link to="/admin/rooms" className="text-primary text-sm font-semibold hover:underline">Manage rooms</Link>
                </div>
                {hotels.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm">No hotels found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {["Hotel Name", "City", "Rating", "Rooms"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {hotels.map((h) => (
                          <tr key={h.id} className="hover:bg-surface-container-low/50">
                            <td className="px-4 py-3 font-semibold whitespace-nowrap">{h.name || "—"}</td>
                            <td className="px-4 py-3 text-on-surface-variant">{h.city || h.location || "—"}</td>
                            <td className="px-4 py-3">
                              {h.rating != null ? (
                                <span className="flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                  <span className="text-xs font-bold">{Number(h.rating).toFixed(1)}</span>
                                </span>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">{h.total_rooms ?? h.rooms_count ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Bookings with nights column */}
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Recent Bookings</h2>
                  <Link to="/admin/bookings" className="text-primary text-sm font-semibold hover:underline">View all</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm">No bookings yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {["#", "Guest", "Check-in", "Nights", "Status"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {recentBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-surface-container-low/50">
                            <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">#{b.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold whitespace-nowrap">{b.guest_name || `User #${b.user_id}`}</p>
                              <p className="text-xs text-on-surface-variant">{b.check_in}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{b.check_in}</td>
                            <td className="px-4 py-3 font-bold">{nightsBetween(b.check_in, b.check_out)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                b.status === "confirmed" ? "bg-green-100 text-green-700"
                                : b.status === "pending" ? "bg-yellow-100 text-yellow-700"
                                : b.status === "completed" ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                              }`}>{b.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* All Registered Users */}
            <div className="bg-white rounded-xl border border-outline-variant/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-outline-variant/20">
                <div>
                  <h2 className="font-extrabold">Registered Users</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">{users.length} total</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="all">All roles</option>
                    <option value="guest">Guest</option>
                    <option value="staff">Staff</option>
                    <option value="hotel_admin">Hotel Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <div className="relative">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[16px]">search</span>
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name or email…"
                      className="border border-outline-variant rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-52"
                    />
                  </div>
                  <Link to="/admin/guests" className="text-primary text-sm font-semibold hover:underline whitespace-nowrap">
                    Manage users →
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low">
                    <tr>
                      {["#", "Name", "Email", "Role", "Verified", "Joined"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-low/50">
                        <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{u.id}</td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">{u.full_name || "—"}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_email_verified
                            ? <span className="text-green-600 material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            : <span className="text-slate-400 material-symbols-outlined text-[18px]">radio_button_unchecked</span>}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                          {userSearch || userRoleFilter !== "all" ? "No users match your filters" : "No users found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
