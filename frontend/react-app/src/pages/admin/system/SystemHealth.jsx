import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getSystemHealth } from "../../../services/admin";

function StatusDot({ status }) {
  const map = {
    ok:      "bg-emerald-500",
    healthy: "bg-emerald-500",
    unknown: "bg-amber-400",
    error:   "bg-red-500",
    degraded:"bg-amber-400",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${map[status] ?? "bg-slate-300"}`} />;
}

function StatusBadge({ status }) {
  const map = {
    ok:      "text-emerald-700 bg-emerald-50 border-emerald-200",
    healthy: "text-emerald-700 bg-emerald-50 border-emerald-200",
    unknown: "text-amber-700 bg-amber-50 border-amber-200",
    error:   "text-red-700 bg-red-50 border-red-200",
    degraded:"text-amber-700 bg-amber-50 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] ?? "text-slate-600 bg-slate-50 border-slate-200"}`}>
      <StatusDot status={status} />{status}
    </span>
  );
}

const SERVICE_META = {
  database: { icon: "storage",       label: "Database",      desc: "PostgreSQL read replica" },
  redis:    { icon: "memory",         label: "Redis",         desc: "Cache & session store" },
  celery:   { icon: "task_alt",       label: "Celery",        desc: "Background task worker" },
};

function ServiceCard({ check }) {
  const meta = SERVICE_META[check.name] ?? { icon: "cloud", label: check.name, desc: "" };
  return (
    <div className={`bg-white rounded-xl border p-5 space-y-3 ${check.status === "error" ? "border-red-200" : check.status === "unknown" ? "border-amber-200" : "border-outline-variant/30"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${check.status === "error" ? "bg-red-50" : check.status === "unknown" ? "bg-amber-50" : "bg-emerald-50"}`}>
            <span className={`material-symbols-outlined text-[20px] ${check.status === "error" ? "text-red-500" : check.status === "unknown" ? "text-amber-500" : "text-emerald-600"}`}
              style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
          </div>
          <div>
            <p className="font-extrabold text-sm">{meta.label}</p>
            <p className="text-xs text-on-surface-variant">{meta.desc}</p>
          </div>
        </div>
        <StatusBadge status={check.status} />
      </div>

      {check.latency_ms != null && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">speed</span>
          <span className="text-xs text-on-surface-variant">Latency</span>
          <span className={`text-xs font-bold ml-auto ${check.latency_ms > 100 ? "text-amber-600" : "text-emerald-700"}`}>
            {check.latency_ms} ms
          </span>
        </div>
      )}

      {check.detail && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{check.detail}</p>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>;
}

export default function SystemHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getSystemHealth()
      .then((r) => { setData(r.data); setLastRefresh(new Date()); })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const checks = data?.checks ?? [];
  const stats = data?.stats ?? {};
  const overallStatus = data?.status ?? "unknown";

  const okCount = checks.filter((c) => c.status === "ok").length;
  const errorCount = checks.filter((c) => c.status === "error").length;
  const unknownCount = checks.filter((c) => c.status === "unknown").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Health</h1>
            <p className="text-on-surface-variant mt-1">Live service status, latency, and error monitoring</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${autoRefresh ? "bg-primary text-white border-primary" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"}`}>
              <span className="material-symbols-outlined text-[15px]">autorenew</span>
              Auto {autoRefresh ? "ON" : "OFF"}
            </button>
            <button onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>refresh</span>Refresh
            </button>
          </div>
        </div>

        {loading && !data ? <Spinner /> : !data ? (
          <div className="text-center py-20 text-on-surface-variant">Failed to load system health data</div>
        ) : (
          <>
            {/* Overall status banner */}
            <div className={`rounded-xl px-5 py-4 flex items-center gap-4 border ${overallStatus === "healthy" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <span className={`material-symbols-outlined text-3xl ${overallStatus === "healthy" ? "text-emerald-500" : "text-amber-500"}`}
                style={{ fontVariationSettings: "'FILL' 1" }}>
                {overallStatus === "healthy" ? "check_circle" : "warning"}
              </span>
              <div className="flex-1">
                <p className={`font-extrabold text-lg ${overallStatus === "healthy" ? "text-emerald-800" : "text-amber-800"}`}>
                  {overallStatus === "healthy" ? "All systems operational" : "System degraded"}
                </p>
                <p className={`text-sm ${overallStatus === "healthy" ? "text-emerald-700" : "text-amber-700"}`}>
                  {okCount}/{checks.length} services healthy
                  {errorCount > 0 && ` · ${errorCount} error${errorCount > 1 ? "s" : ""}`}
                  {unknownCount > 0 && ` · ${unknownCount} unknown`}
                </p>
              </div>
              {lastRefresh && (
                <p className="text-xs text-on-surface-variant shrink-0">
                  Last checked {lastRefresh.toLocaleTimeString()}
                  {autoRefresh && <span className="ml-1 text-primary font-bold">· auto</span>}
                </p>
              )}
            </div>

            {/* Service cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {checks.map((check) => <ServiceCard key={check.name} check={check} />)}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "error",          label: "Errors (24h)",        value: stats.recent_errors_24h ?? 0,     color: stats.recent_errors_24h > 0 ? "text-red-600" : "text-emerald-600",   bg: stats.recent_errors_24h > 0 ? "bg-red-50" : "bg-emerald-50" },
                { icon: "history",        label: "Total Activity Logs", value: (stats.total_activity_logs ?? 0).toLocaleString(), color: "text-primary", bg: "bg-primary/5" },
                { icon: "cloud_done",     label: "Services OK",         value: `${okCount}/${checks.length}`,    color: "text-emerald-600",   bg: "bg-emerald-50" },
                { icon: "speed",          label: "DB Latency",          value: checks.find((c) => c.name === "database")?.latency_ms != null ? `${checks.find((c) => c.name === "database").latency_ms} ms` : "—", color: "text-violet-600", bg: "bg-violet-50" },
              ].map(({ icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold">{value}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-on-surface-variant text-right">
              Server timestamp: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : "—"}
            </p>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
