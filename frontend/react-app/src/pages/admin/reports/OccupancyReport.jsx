import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getOccupancyReport } from "../../../services/admin";

const PERIODS = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }];

export default function OccupancyReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    getOccupancyReport(days).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  const daily = data?.daily_bookings?.slice(-days) || [];
  const maxBookings = Math.max(...daily.map((d) => d.bookings), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Occupancy Report</h1>
            <p className="text-on-surface-variant mt-1">Room usage and booking trends</p>
          </div>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setDays(p.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${days === p.value ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Rooms", value: data?.total_rooms ?? "—", icon: "bed", color: "text-blue-600", bg: "bg-blue-50" },
                { label: `Bookings (${days}d)`, value: data?.total_bookings ?? "—", icon: "book_online", color: "text-green-600", bg: "bg-green-50" },
                { label: "Occupancy Rate", value: data ? `${data.occupancy_rate_pct}%` : "—", icon: "percent", color: "text-purple-600", bg: "bg-purple-50" },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-6 flex items-center gap-4">
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

            <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
              <h2 className="font-extrabold mb-5">Daily Bookings</h2>
              {daily.length === 0 ? (
                <p className="text-center text-on-surface-variant py-8">No data available</p>
              ) : (
                <div className="space-y-2.5">
                  {daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant w-24 shrink-0">{d.date}</span>
                      <div className="flex-1 bg-surface-container rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${(d.bookings / maxBookings) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{d.bookings}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
