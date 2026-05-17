import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getRevenueReport } from "../../../services/admin";

const PERIODS = [
  { label: "7d", value: 7 }, { label: "14d", value: 14 }, { label: "30d", value: 30 },
  { label: "60d", value: 60 }, { label: "90d", value: 90 }, { label: "1y", value: 365 },
];

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
        <p className="text-xl font-extrabold truncate">{value}</p>
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

function downloadCSV(rows, filename) {
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export default function RevenueReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState("overview"); // overview | breakdown | hotels | forecast

  const load = useCallback(() => {
    setLoading(true);
    getRevenueReport(days).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    if (!data?.daily_revenue) return;
    const rows = ["date,revenue", ...data.daily_revenue.map((d) => `${d.date},${d.revenue}`)];
    downloadCSV(rows, `revenue_${days}d.csv`);
  }

  const daily = data?.daily_revenue ?? [];
  const maxRev = Math.max(...daily.map((d) => Number(d.revenue || 0)), 1);
  const totalRev = Number(data?.total_revenue ?? 0);
  const taxEst = Number(data?.tax_estimate ?? totalRev * 0.1);
  const netRev = Number(data?.net_revenue ?? totalRev - taxEst);
  const avgDaily = Number(data?.avg_daily_revenue ?? (totalRev / Math.max(days, 1)));
  const prevRev = data?.vs_previous?.total_revenue;
  const delta = prevRev != null && prevRev > 0 ? Math.round(((totalRev - prevRev) / prevRev) * 100) : null;
  const projMonthly = avgDaily * 30;
  const byHotel = data?.by_hotel ?? [];
  const cancLoss = Number(data?.cancellation_losses ?? 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Revenue Report</h1>
            <p className="text-on-surface-variant mt-1">Financial performance, earnings, and forecasting</p>
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
              <KpiCard icon="payments" label={`Total Revenue (${days}d)`} value={`$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                delta={delta} color="text-primary" bg="bg-primary/5"
                sub={prevRev != null ? `vs $${Number(prevRev).toLocaleString(undefined, { maximumFractionDigits: 0 })} prev` : null} />
              <KpiCard icon="trending_up" label="Avg Daily Revenue" value={`$${avgDaily.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                color="text-green-600" bg="bg-green-50" />
              <KpiCard icon="auto_graph" label="Projected (30d)" value={`$${projMonthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                color="text-violet-600" bg="bg-violet-50" sub="Based on avg daily rate" />
              <KpiCard icon="block" label="Cancellation Losses" value={`$${cancLoss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                color="text-red-500" bg="bg-red-50" sub="Revenue lost to cancellations" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit flex-wrap">
              {[["overview", "bar_chart", "Overview"], ["breakdown", "pie_chart", "Financial Breakdown"], ["hotels", "hotel", "By Hotel"], ["forecast", "auto_graph", "Forecast"]].map(([t, icon, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-white shadow text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {tab === "overview" && (
              <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold">Daily Revenue</h2>
                  <span className="text-xs text-on-surface-variant">Peak: ${Math.max(...daily.map((d) => Number(d.revenue || 0))).toLocaleString()}/day</span>
                </div>
                {daily.length === 0 ? <p className="text-center text-on-surface-variant py-8">No revenue data</p> : (
                  <>
                    <div className="flex items-end gap-0.5" style={{ height: 140 }}>
                      {daily.slice(-60).map((d, i) => {
                        const val = Number(d.revenue || 0);
                        const pct = maxRev > 0 ? (val / maxRev) * 100 : 0;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 min-w-0 group relative" style={{ height: "100%" }}>
                            <div className="flex-1 flex items-end w-full">
                              <div title={`${d.date}: $${val.toLocaleString()}`}
                                className="w-full bg-primary/20 group-hover:bg-primary rounded-t transition-all cursor-default"
                                style={{ height: `${Math.max(pct, 1)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pt-2 border-t border-outline-variant/20">
                      {[...daily].reverse().map((d) => (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant w-24 shrink-0">{d.date}</span>
                          <div className="flex-1 bg-surface-container rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${(Number(d.revenue || 0) / maxRev) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold w-20 text-right">${Number(d.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Financial Breakdown tab */}
            {tab === "breakdown" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-4">
                  <h2 className="font-extrabold">Financial Summary</h2>
                  {[
                    { label: "Gross Revenue", value: totalRev, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Est. Tax (10%)", value: -taxEst, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Net Revenue", value: netRev, color: "text-emerald-600", bg: "bg-emerald-50", bold: true },
                    { label: "Cancellation Losses", value: -cancLoss, color: "text-orange-500", bg: "bg-orange-50" },
                  ].map(({ label, value, color, bg, bold }) => (
                    <div key={label} className={`flex items-center justify-between p-3 rounded-lg ${bg}`}>
                      <span className="text-sm font-semibold">{label}</span>
                      <span className={`font-extrabold ${color} ${bold ? "text-lg" : ""}`}>
                        {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-4">
                  <h2 className="font-extrabold">Revenue Metrics</h2>
                  {[
                    { label: "Period", value: `${days} days`, icon: "calendar_today" },
                    { label: "Total Days with Revenue", value: daily.filter((d) => Number(d.revenue) > 0).length, icon: "event_available" },
                    { label: "Highest Revenue Day", value: daily.length > 0 ? `$${Math.max(...daily.map((d) => Number(d.revenue || 0))).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—", icon: "emoji_events" },
                    { label: "Lowest Revenue Day", value: daily.filter((d) => Number(d.revenue) > 0).length > 0 ? `$${Math.min(...daily.filter((d) => Number(d.revenue) > 0).map((d) => Number(d.revenue))).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—", icon: "south" },
                    { label: "vs Previous Period", value: delta != null ? `${delta >= 0 ? "+" : ""}${delta}%` : "N/A", icon: "compare_arrows" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>{label}
                      </div>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By Hotel tab */}
            {tab === "hotels" && (
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20">
                  <h2 className="font-extrabold">Revenue by Hotel</h2>
                </div>
                {byHotel.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-12 text-sm">No multi-hotel data available</p>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {byHotel.sort((a, b) => b.revenue - a.revenue).map((h, i) => {
                      const maxH = Math.max(...byHotel.map((x) => x.revenue), 1);
                      const pct = Math.round((h.revenue / maxH) * 100);
                      return (
                        <div key={h.hotel_id ?? i} className="px-6 py-4 flex items-center gap-4">
                          <span className="text-xs font-extrabold text-on-surface-variant w-5">{i + 1}</span>
                          <div className="w-36 shrink-0">
                            <p className="font-semibold text-sm truncate">{h.hotel_name || `Hotel #${h.hotel_id}`}</p>
                          </div>
                          <div className="flex-1 bg-surface-container rounded-full h-3">
                            <div className="bg-primary h-3 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-extrabold text-primary w-24 text-right text-sm">${Number(h.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Forecast tab */}
            {tab === "forecast" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-4">
                  <div>
                    <h2 className="font-extrabold">Revenue Forecast (Next 30 Days)</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Projection based on current average daily revenue of ${avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "7-day projection", value: avgDaily * 7 },
                      { label: "14-day projection", value: avgDaily * 14 },
                      { label: "30-day projection", value: avgDaily * 30 },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                        <p className="text-xl font-extrabold text-violet-700">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-violet-600 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-semibold flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                    Revenue forecasts are linear projections based on the selected period's average. Seasonal events, promotions, and market changes will affect actual results.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
