import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getGuestAnalytics } from "../../../services/admin";

const PERIODS = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }];

export default function GuestAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    getGuestAnalytics(days).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Guest Analytics</h1>
            <p className="text-on-surface-variant mt-1">New guests, return rate, and top spenders</p>
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
                { label: `New Guests (${days}d)`, value: data?.new_guests ?? "—", icon: "person_add", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Total Guests", value: data?.total_guests ?? "—", icon: "group", color: "text-green-600", bg: "bg-green-50" },
                { label: "Return Rate", value: data?.return_rate_pct != null ? `${data.return_rate_pct}%` : "—", icon: "repeat", color: "text-purple-600", bg: "bg-purple-50" },
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

            {data?.top_guests?.length > 0 && (
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Top Guests by Spend</h2>
                </div>
                <div className="divide-y divide-outline-variant/20">
                  {data.top_guests.map((g, i) => (
                    <div key={g.user_id || i} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-on-surface-variant w-5">{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold">{g.name || `Guest #${g.user_id}`}</p>
                          <p className="text-xs text-on-surface-variant">{g.email} · {g.bookings} booking{g.bookings !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <p className="font-extrabold text-primary">${Number(g.total_spent || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
