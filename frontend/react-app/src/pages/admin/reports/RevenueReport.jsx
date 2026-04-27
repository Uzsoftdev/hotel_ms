import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getRevenueReport } from "../../../services/admin";

const PERIODS = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }];

export default function RevenueReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    getRevenueReport(days).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  const daily = data?.daily_revenue || [];
  const maxRevenue = Math.max(...daily.map((d) => d.revenue || 0), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Revenue Report</h1>
            <p className="text-on-surface-variant mt-1">Earnings breakdown and daily trends</p>
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
                { label: `Total Revenue (${days}d)`, value: data ? `$${Number(data.total_revenue).toLocaleString()}` : "—", icon: "attach_money", color: "text-primary", bg: "bg-primary/5" },
                { label: "Paid Bookings", value: data?.paid_bookings ?? "—", icon: "receipt_long", color: "text-green-600", bg: "bg-green-50" },
                { label: "Avg per Booking", value: data?.avg_booking_value ? `$${Number(data.avg_booking_value).toLocaleString()}` : "—", icon: "trending_up", color: "text-purple-600", bg: "bg-purple-50" },
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
              <h2 className="font-extrabold mb-5">Daily Revenue</h2>
              {daily.length === 0 ? (
                <p className="text-center text-on-surface-variant py-8">No revenue data available</p>
              ) : (
                <div className="space-y-2.5">
                  {daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant w-24 shrink-0">{d.date}</span>
                      <div className="flex-1 bg-surface-container rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${((d.revenue || 0) / maxRevenue) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-20 text-right">${Number(d.revenue || 0).toLocaleString()}</span>
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
