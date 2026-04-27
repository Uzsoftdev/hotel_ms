import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./Layout/AdminLayout";
import { getOccupancyReport, getRevenueReport, getAllBookings } from "../../services/admin";

export default function AdminDashboard() {
  const [occupancy, setOccupancy] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOccupancyReport(30), getRevenueReport(30), getAllBookings()])
      .then(([o, r, b]) => { setOccupancy(o.data); setRevenue(r.data); setRecentBookings(b.data.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: "bed", label: "Total Rooms", value: occupancy?.total_rooms ?? "—", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: "book_online", label: "Bookings (30d)", value: occupancy?.total_bookings ?? "—", color: "text-green-600", bg: "bg-green-50" },
    { icon: "percent", label: "Occupancy Rate", value: occupancy ? `${occupancy.occupancy_rate_pct}%` : "—", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: "attach_money", label: "Revenue (30d)", value: revenue ? `$${Number(revenue.total_revenue).toLocaleString()}` : "—", color: "text-primary", bg: "bg-primary/5" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Overview for the last 30 days</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {kpis.map(({ icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-xl p-6 border border-outline-variant/30 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                  </div>
                </div>
              ))}
            </div>
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
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{b.status}</span>
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}
