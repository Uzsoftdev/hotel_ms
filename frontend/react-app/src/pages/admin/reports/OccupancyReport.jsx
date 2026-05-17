import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getOccupancyReport, exportReport } from "../../../services/admin";

const PERIODS = [
  { label: "7d", value: 7 }, { label: "14d", value: 14 }, { label: "30d", value: 30 },
  { label: "60d", value: 60 }, { label: "90d", value: 90 }, { label: "1y", value: 365 },
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Spinner() {
  return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>;
}

function KpiCard({ icon, label, value, sub, color = "text-primary", bg = "bg-primary/5", delta }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold truncate">{value}</p>
        <p className="text-xs text-on-surface-variant">{label}</p>
        {sub && <p className="text-[10px] text-on-surface-variant mt-0.5">{sub}</p>}
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold mt-0.5 ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            <span className="material-symbols-outlined text-[12px]">{delta >= 0 ? "arrow_upward" : "arrow_downward"}</span>
            {Math.abs(delta)}% vs prev
          </span>
        )}
      </div>
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, color = "bg-primary", maxVal }) {
  const max = maxVal ?? Math.max(...data.map((d) => Number(d[valueKey] || 0)), 1);
  const show = data.slice(-60);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 140 }}>
      {show.map((d, i) => {
        const val = Number(d[valueKey] || 0);
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0 group relative" style={{ height: "100%" }}>
            <div className="flex-1 flex items-end w-full">
              <div
                title={`${d[labelKey]}: ${val}`}
                className={`w-full ${color}/30 group-hover:${color} rounded-t transition-all cursor-default`}
                style={{ height: `${Math.max(pct, 1)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({ data }) {
  if (!data || data.length === 0) return <p className="text-center text-on-surface-variant text-sm py-6">No heatmap data</p>;
  const maxVal = Math.max(...data.map((d) => d.bookings), 1);
  const byDow = [0, 1, 2, 3, 4, 5, 6].map((dow) => data.filter((d) => d.dow === dow));
  const weeks = Math.ceil(data.length / 7);

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1 min-w-max" style={{ gridTemplateColumns: `3rem repeat(${weeks}, 1.5rem)` }}>
        <div />
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} className="text-center text-[9px] text-on-surface-variant">W{w + 1}</div>
        ))}
        {DOW.map((day, dow) => (
          <>
            <div key={`l${dow}`} className="text-[9px] text-on-surface-variant flex items-center">{day}</div>
            {Array.from({ length: weeks }, (_, w) => {
              const cell = byDow[dow]?.[w];
              const val = cell?.bookings ?? 0;
              const intensity = maxVal > 0 ? val / maxVal : 0;
              const alpha = Math.round(intensity * 100);
              return (
                <div key={`${dow}-${w}`}
                  title={cell ? `${cell.date}: ${val} bookings` : "No data"}
                  className="w-6 h-6 rounded-sm cursor-default transition-all"
                  style={{ backgroundColor: val === 0 ? "#f1f5f9" : `rgba(37, 99, 235, ${0.1 + intensity * 0.9})` }}
                />
              );
            })}
          </>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[9px] text-on-surface-variant">Low</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((a) => (
          <div key={a} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(37,99,235,${a})` }} />
        ))}
        <span className="text-[9px] text-on-surface-variant">High</span>
      </div>
    </div>
  );
}

function downloadCSV(rows, filename) {
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export default function OccupancyReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState("trend"); // trend | heatmap | types | forecast

  const load = useCallback(() => {
    setLoading(true);
    getOccupancyReport(days).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    if (!data?.daily_bookings) return;
    const rows = ["date,bookings", ...data.daily_bookings.map((d) => `${d.date},${d.bookings}`)];
    downloadCSV(rows, `occupancy_${days}d.csv`);
  }

  const daily = data?.daily_bookings ?? [];
  const maxB = Math.max(...daily.map((d) => d.bookings), 1);
  const prevOcc = data?.vs_previous?.occupancy_rate_pct;
  const currOcc = data?.occupancy_rate_pct ?? 0;
  const delta = prevOcc != null ? Math.round(((currOcc - prevOcc) / Math.max(prevOcc, 0.1)) * 100) : null;
  const byType = data?.by_room_type ?? [];
  const forecast = data?.forecast ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Occupancy Report</h1>
            <p className="text-on-surface-variant mt-1">Real-time room usage, trends, and forecasting</p>
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-[16px]">download</span>CSV
            </button>
            <button onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-[16px]">refresh</span>Refresh
            </button>
          </div>
        </div>

        {loading ? <Spinner /> : !data ? (
          <div className="text-center py-20 text-on-surface-variant">Failed to load data</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="bed" label="Total Rooms" value={data.total_rooms ?? "—"} color="text-blue-600" bg="bg-blue-50" />
              <KpiCard icon="book_online" label={`Bookings (${days}d)`} value={data.total_bookings ?? "—"}
                sub={data.vs_previous ? `vs ${data.vs_previous.total_bookings} prev period` : null}
                color="text-green-600" bg="bg-green-50" />
              <KpiCard icon="percent" label="Occupancy Rate" value={`${currOcc}%`} delta={delta} color="text-purple-600" bg="bg-purple-50" />
              <KpiCard icon="trending_up" label="Avg Daily Bookings"
                value={daily.length > 0 ? (data.total_bookings / days).toFixed(1) : "—"}
                color="text-amber-600" bg="bg-amber-50" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit">
              {[["trend", "show_chart", "Trend"], ["heatmap", "grid_view", "Heatmap"], ["types", "category", "By Room Type"], ["forecast", "auto_graph", "Forecast"]].map(([t, icon, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-white shadow text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
                </button>
              ))}
            </div>

            {/* Trend Tab */}
            {tab === "trend" && (
              <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold">Daily Bookings — Last {days} days</h2>
                  <span className="text-xs text-on-surface-variant">Peak: {maxB} bookings/day</span>
                </div>
                {daily.length === 0 ? <p className="text-center text-on-surface-variant py-8">No data</p> : (
                  <>
                    <BarChart data={daily} valueKey="bookings" labelKey="date" color="bg-primary" maxVal={maxB} />
                    <div className="pt-4 border-t border-outline-variant/20 space-y-2 max-h-64 overflow-y-auto">
                      {[...daily].reverse().map((d) => (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant w-24 shrink-0">{d.date}</span>
                          <div className="flex-1 bg-surface-container rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${(d.bookings / maxB) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold w-8 text-right">{d.bookings}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Heatmap Tab */}
            {tab === "heatmap" && (
              <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
                <div className="mb-4">
                  <h2 className="font-extrabold">Occupancy Heatmap</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Booking intensity by day of week — darker = more bookings</p>
                </div>
                <Heatmap data={data.heatmap ?? daily.map((d, i) => ({ ...d, dow: i % 7 }))} />
              </div>
            )}

            {/* By Room Type Tab */}
            {tab === "types" && (
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Occupancy by Room Type</h2>
                </div>
                {byType.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-12 text-sm">No room type data available</p>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {byType.map((rt) => {
                      const pct = rt.occupancy_pct ?? (rt.total_rooms > 0 ? Math.round((rt.booked / rt.total_rooms) * 100) : 0);
                      return (
                        <div key={rt.room_type} className="px-6 py-4 flex items-center gap-4">
                          <div className="w-32 shrink-0">
                            <p className="font-semibold text-sm">{rt.room_type}</p>
                            <p className="text-xs text-on-surface-variant">{rt.booked}/{rt.total_rooms} rooms</p>
                          </div>
                          <div className="flex-1 bg-surface-container rounded-full h-3">
                            <div className={`h-3 rounded-full transition-all ${pct >= 80 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-primary"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-sm font-extrabold w-12 text-right ${pct >= 80 ? "text-red-500" : pct >= 60 ? "text-amber-500" : "text-primary"}`}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Forecast Tab */}
            {tab === "forecast" && (
              <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-4">
                <div>
                  <h2 className="font-extrabold">14-Day Occupancy Forecast</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Projected based on same day-of-week averages from the past {days} days</p>
                </div>
                {forecast.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-8 text-sm">Forecast requires at least 7 days of data</p>
                ) : (
                  <div className="space-y-2">
                    {forecast.map((d) => {
                      const max = Math.max(...forecast.map((f) => f.projected ?? f.projected_bookings ?? 0), 1);
                      const val = d.projected ?? d.projected_bookings ?? 0;
                      return (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant w-24 shrink-0">{d.date}</span>
                          <div className="flex-1 bg-surface-container rounded-full h-2.5">
                            <div className="bg-violet-400 h-2.5 rounded-full" style={{ width: `${(val / max) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold w-14 text-right text-violet-600">~{Number(val).toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <p className="text-xs text-violet-700 font-semibold">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                    Forecast is based on historical day-of-week patterns. Actual results may vary based on seasonal events and market conditions.
                  </p>
                </div>
              </div>
            )}

            {/* Seasonal insight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { day: "Weekdays", count: daily.filter((_, i) => new Date(_.date).getDay() >= 1 && new Date(_.date).getDay() <= 5).reduce((s, d) => s + d.bookings, 0), icon: "work", color: "text-blue-600" },
                { day: "Weekends", count: daily.filter((d) => [0, 6].includes(new Date(d.date).getDay())).reduce((s, d) => s + d.bookings, 0), icon: "weekend", color: "text-amber-600" },
                { day: "Peak Day", count: daily.length > 0 ? `${[...daily].sort((a, b) => b.bookings - a.bookings)[0]?.date} (${maxB})` : "—", icon: "emoji_events", color: "text-emerald-600" },
              ].map(({ day, count, icon, color }) => (
                <div key={day} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-center gap-3">
                  <span className={`material-symbols-outlined ${color} text-[28px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <div>
                    <p className="font-extrabold text-lg">{count}</p>
                    <p className="text-xs text-on-surface-variant">{day}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
