import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getGuestAnalytics } from "../../../services/admin";

const PERIODS = [
  { label: "7d", value: 7 }, { label: "14d", value: 14 }, { label: "30d", value: 30 },
  { label: "60d", value: 60 }, { label: "90d", value: 90 }, { label: "1y", value: 365 },
];

function Spinner() {
  return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>;
}

function downloadCSV(rows, filename) {
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function DonutSegments({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className="text-center text-on-surface-variant text-sm py-4">No data</p>;
  let cumPct = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
          {segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            const dash = `${pct} ${100 - pct}`;
            const offset = 100 - cumPct;
            cumPct += pct;
            return (
              <circle key={seg.label} cx="18" cy="18" r="15.915" fill="none"
                stroke={seg.color} strokeWidth="4"
                strokeDasharray={dash} strokeDashoffset={offset} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{total}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.label} className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-on-surface-variant">{seg.label}</span>
              <span className="font-bold ml-auto pl-3">{seg.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GuestAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState("overview"); // overview | retention | clv | bookings

  const load = useCallback(() => {
    setLoading(true);
    getGuestAnalytics(days).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    if (!data?.top_guests) return;
    const rows = ["user_id,name,email,booking_count,total_spent",
      ...data.top_guests.map((g) => `${g.user_id},"${g.name}","${g.email}",${g.booking_count},${g.total_spent}`)];
    downloadCSV(rows, `guest_analytics_${days}d.csv`);
  }

  const topGuests = data?.top_guests ?? [];
  const statusBreakdown = data?.bookings_by_status ?? {};
  const totalBookingStatuses = Object.values(statusBreakdown).reduce((s, v) => s + v, 0);
  const clvSegments = data?.clv_segments ?? {};
  const frequency = data?.booking_frequency ?? {};
  const avgNights = data?.avg_nights ?? data?.avg_stay_days ?? null;

  const retentionSegments = [
    { label: "New Guests", value: data?.new_guests ?? 0, color: "#3b82f6" },
    { label: "Returning", value: data?.returning_guests ?? 0, color: "#10b981" },
  ];

  const clvSegList = [
    { label: "< $500", value: clvSegments.under_500 ?? 0, color: "#94a3b8" },
    { label: "$500–$2k", value: clvSegments["500_to_2000"] ?? 0, color: "#60a5fa" },
    { label: "$2k–$5k", value: clvSegments["2000_to_5000"] ?? 0, color: "#8b5cf6" },
    { label: "> $5k", value: clvSegments.over_5000 ?? 0, color: "#f59e0b" },
  ];

  const freqSegList = [
    { label: "One-time (1 booking)", value: frequency.one_time ?? 0, color: "#94a3b8" },
    { label: "Repeat (2 bookings)", value: frequency.repeat_2x ?? 0, color: "#60a5fa" },
    { label: "Loyal (3+ bookings)", value: frequency.loyal_3plus ?? 0, color: "#10b981" },
  ];

  const statusColors = { confirmed: "#10b981", pending: "#f59e0b", cancelled: "#ef4444", completed: "#3b82f6" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Guest Analytics</h1>
            <p className="text-on-surface-variant mt-1">Behavior, retention, lifetime value, and booking patterns</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-surface-container rounded-xl p-1">
              {PERIODS.map(({ label, value }) => (
                <button key={value} onClick={() => setDays(value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${days === value ? "bg-white shadow text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[16px]">download</span>CSV
            </button>
            <button onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        {loading ? <Spinner /> : !data ? (
          <div className="text-center py-20 text-on-surface-variant">Failed to load data</div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "person_add", label: `New Guests (${days}d)`, value: data.new_guests ?? "—", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: "group", label: "Returning Guests", value: data.returning_guests ?? "—", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: "repeat", label: "Return Rate", value: data.return_rate_pct != null ? `${data.return_rate_pct}%` : "—", color: "text-purple-600", bg: "bg-purple-50" },
                { icon: "bed", label: "Avg Stay Length", value: avgNights != null ? `${Number(avgNights).toFixed(1)} nights` : "—", color: "text-amber-600", bg: "bg-amber-50" },
              ].map(({ icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit flex-wrap">
              {[["overview", "dashboard", "Overview"], ["retention", "loyalty", "Retention"], ["clv", "workspace_premium", "Lifetime Value"], ["bookings", "book_online", "Bookings"]].map(([t, icon, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-white shadow text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
                  <h2 className="font-extrabold mb-4">Guest Composition</h2>
                  <DonutSegments segments={retentionSegments} />
                </div>
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
                  <h2 className="font-extrabold mb-4">Booking Status Breakdown</h2>
                  {totalBookingStatuses === 0 ? <p className="text-on-surface-variant text-sm">No booking data</p> : (
                    <div className="space-y-3">
                      {Object.entries(statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-3">
                          <span className="text-xs capitalize text-on-surface-variant w-20 shrink-0">{status}</span>
                          <div className="flex-1 bg-surface-container rounded-full h-3">
                            <div className="h-3 rounded-full" style={{ width: `${(count / totalBookingStatuses) * 100}%`, backgroundColor: statusColors[status] || "#94a3b8" }} />
                          </div>
                          <span className="text-xs font-bold w-14 text-right">{count} ({Math.round((count / totalBookingStatuses) * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Retention tab */}
            {tab === "retention" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
                  <h2 className="font-extrabold mb-4">Booking Frequency</h2>
                  <p className="text-xs text-on-surface-variant mb-4">How many guests are truly loyal?</p>
                  <DonutSegments segments={freqSegList} />
                </div>
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-4">
                  <h2 className="font-extrabold">Retention Metrics</h2>
                  {[
                    { label: "Return Rate", value: `${data.return_rate_pct ?? 0}%`, icon: "repeat", good: (data.return_rate_pct ?? 0) > 25 },
                    { label: "New vs Returning", value: `${data.new_guests ?? 0} / ${data.returning_guests ?? 0}`, icon: "compare" },
                    { label: "Loyal Guests (3+ bookings)", value: frequency.loyal_3plus ?? 0, icon: "workspace_premium" },
                    { label: "One-Time Guests", value: frequency.one_time ?? 0, icon: "person" },
                    { label: "Avg Stay Duration", value: avgNights != null ? `${Number(avgNights).toFixed(1)} nights` : "—", icon: "bed" },
                  ].map(({ label, value, icon, good }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>{label}
                      </div>
                      <span className={`font-bold ${good === true ? "text-emerald-600" : good === false ? "text-red-500" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLV tab */}
            {tab === "clv" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
                  <h2 className="font-extrabold mb-2">Customer Lifetime Value Segments</h2>
                  <p className="text-xs text-on-surface-variant mb-4">Distribution of all-time guest spending</p>
                  <DonutSegments segments={clvSegList} />
                </div>
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
                  <h2 className="font-extrabold mb-4">Top 10 Guests by Lifetime Value</h2>
                  {topGuests.length === 0 ? <p className="text-on-surface-variant text-sm">No data available</p> : (
                    <div className="space-y-3">
                      {topGuests.slice(0, 10).map((g, i) => (
                        <div key={g.user_id ?? i} className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-on-surface-variant w-5">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{g.name || `Guest #${g.user_id}`}</p>
                            <p className="text-xs text-on-surface-variant">{g.booking_count} booking{g.booking_count !== 1 ? "s" : ""}</p>
                          </div>
                          <span className="font-extrabold text-primary text-sm">${Number(g.total_spent || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings tab */}
            {tab === "bookings" && (
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Top Guests Detailed View</h2>
                </div>
                {topGuests.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-12 text-sm">No guest data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {["#", "Guest", "Email", "Bookings", "Total Spent", "Avg/Booking"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {topGuests.map((g, i) => {
                          const avg = g.booking_count > 0 ? g.total_spent / g.booking_count : 0;
                          return (
                            <tr key={g.user_id ?? i} className="hover:bg-surface-container-low/50">
                              <td className="px-4 py-3 text-xs text-on-surface-variant">{i + 1}</td>
                              <td className="px-4 py-3 font-semibold">{g.name || `Guest #${g.user_id}`}</td>
                              <td className="px-4 py-3 text-xs text-on-surface-variant">{g.email}</td>
                              <td className="px-4 py-3 font-bold">{g.booking_count}</td>
                              <td className="px-4 py-3 font-extrabold text-primary">${Number(g.total_spent || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                              <td className="px-4 py-3 text-on-surface-variant">${avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
