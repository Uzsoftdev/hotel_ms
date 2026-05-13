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

export default function AdminDashboard() {
  const [occupancy, setOccupancy] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  useEffect(() => {
    Promise.allSettled([
      getOccupancyReport(30),
      getRevenueReport(30),
      getAllBookings(),
      getUsers(),
      getHotels(),
    ]).then(([o, r, b, u, h]) => {
      if (o.status === "fulfilled") setOccupancy(o.value.data);
      if (r.status === "fulfilled") setRevenue(r.value.data);
      if (b.status === "fulfilled") setRecentBookings(b.value.data.slice(0, 5));
      if (u.status === "fulfilled") setUsers(Array.isArray(u.value.data) ? u.value.data : []);
      if (h.status === "fulfilled") setHotels(Array.isArray(h.value.data) ? h.value.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: "hotel", label: "Total Hotels", value: hotels.length || "—", color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: "bed", label: "Total Rooms", value: occupancy?.total_rooms ?? "—", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: "group", label: "Registered Users", value: users.length || "—", color: "text-teal-600", bg: "bg-teal-50" },
    { icon: "book_online", label: "Bookings (30d)", value: occupancy?.total_bookings ?? "—", color: "text-green-600", bg: "bg-green-50" },
    { icon: "percent", label: "Occupancy Rate", value: occupancy ? `${occupancy.occupancy_rate_pct}%` : "—", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: "attach_money", label: "Revenue (30d)", value: revenue ? `$${Number(revenue.total_revenue).toLocaleString()}` : "—", color: "text-primary", bg: "bg-primary/5" },
  ];

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Overview for the last 30 days</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpis.map(({ icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-xs text-on-surface-variant leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bookings + Chart row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Recent Bookings</h2>
                  <Link to="/admin/bookings" className="text-primary text-sm font-semibold hover:underline">View all</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm">No bookings yet</div>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="text-sm font-semibold">#{b.id} — {b.guest_name || `User #${b.user_id}`}</p>
                          <p className="text-xs text-on-surface-variant">{b.check_in} → {b.check_out}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          b.status === "confirmed" ? "bg-green-100 text-green-700"
                          : b.status === "pending" ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Daily Bookings (Last 7 days)</h2>
                </div>
                <div className="p-6">
                  {(occupancy?.daily_bookings?.slice(-7) || []).length === 0 ? (
                    <div className="py-8 text-center text-on-surface-variant text-sm">No data available</div>
                  ) : (
                    <div className="space-y-3">
                      {(occupancy?.daily_bookings?.slice(-7) || []).map((d) => {
                        const max = Math.max(...(occupancy?.daily_bookings?.slice(-7) || [{ bookings: 1 }]).map((x) => x.bookings), 1);
                        return (
                          <div key={d.date} className="flex items-center gap-3">
                            <span className="text-xs text-on-surface-variant w-24 shrink-0">{d.date}</span>
                            <div className="flex-1 bg-surface-container rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(d.bookings / max) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold w-6 text-right">{d.bookings}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                  {/* Role filter */}
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
                  {/* Search */}
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
