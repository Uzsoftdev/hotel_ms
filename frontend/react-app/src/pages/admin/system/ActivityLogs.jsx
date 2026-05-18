import { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getActivityLogs, getActivityLogStats } from "../../../services/admin";

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY = {
  critical: { label: "Critical", color: "text-red-700 bg-red-100 border-red-200",  dot: "bg-red-500",    row: "bg-red-50/50",    icon: "dangerous" },
  high:     { label: "High",     color: "text-orange-700 bg-orange-100 border-orange-200", dot: "bg-orange-400", row: "bg-orange-50/40", icon: "warning" },
  medium:   { label: "Medium",   color: "text-amber-700 bg-amber-100 border-amber-200",  dot: "bg-amber-400",  row: "",               icon: "info" },
  low:      { label: "Low",      color: "text-blue-700 bg-blue-100 border-blue-200",    dot: "bg-blue-400",   row: "",               icon: "check_circle" },
  info:     { label: "Info",     color: "text-slate-600 bg-slate-100 border-slate-200",  dot: "bg-slate-300",  row: "",               icon: "radio_button_unchecked" },
};

const ROLE_COLORS = {
  super_admin: "bg-red-100 text-red-700",
  hotel_admin: "bg-orange-100 text-orange-700",
  staff:       "bg-blue-100 text-blue-700",
  guest:       "bg-green-100 text-green-700",
};

const ACTION_ICON = {
  login: "login", logout: "logout", create: "add_circle", update: "edit",
  delete: "delete", cancel: "cancel", ban: "block", error: "error",
  fail: "error", view: "visibility", export: "download", checkin: "check_circle",
  checkout: "logout", payment: "payments",
};

function actionIcon(action = "") {
  const k = Object.keys(ACTION_ICON).find((k) => action.toLowerCase().includes(k));
  return ACTION_ICON[k] ?? "radio_button_unchecked";
}

// ─── Local storage helpers ────────────────────────────────────────────────────
function useLocalObj(key) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
  });
  const set = useCallback((updater) => {
    setVal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);
  return [val, set];
}

// ─── Small UI primitives ─────────────────────────────────────────────────────
function Spinner() {
  return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>;
}

function SevBadge({ severity }) {
  const s = SEVERITY[severity] ?? SEVERITY.info;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>
      <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

function MiniBar({ value, max, color = "bg-primary" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-container rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="text-xs font-bold w-8 text-right">{value}</span>
    </div>
  );
}

// ─── Expanded row detail ──────────────────────────────────────────────────────
function ExpandedRow({ log, note, onSaveNote, isBookmarked, onToggleBookmark }) {
  const [draft, setDraft] = useState(note || "");
  const [editing, setEditing] = useState(false);

  function saveNote() {
    onSaveNote(draft);
    setEditing(false);
  }

  return (
    <div className="bg-surface-container-low border-t border-outline-variant/20 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: full fields */}
      <div className="space-y-2 text-sm">
        {[
          { label: "Log ID",     value: `#${log.id}` },
          { label: "User",       value: log.user_name ? `${log.user_name} (${log.user_role || "?"})` : log.user_id ? `User #${log.user_id}` : "system" },
          { label: "Action",     value: log.action },
          { label: "Severity",   value: <SevBadge severity={log.severity} /> },
          { label: "Resource",   value: log.resource ? `${log.resource}${log.resource_id ? ` #${log.resource_id}` : ""}` : "—" },
          { label: "IP Address", value: log.ip_address || "—" },
          { label: "Timestamp",  value: log.created_at ? new Date(log.created_at).toLocaleString() : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <span className="w-24 shrink-0 text-on-surface-variant text-xs pt-0.5">{label}</span>
            <span className="font-semibold text-xs">{value}</span>
          </div>
        ))}
        {log.detail && (
          <div className="flex items-start gap-2">
            <span className="w-24 shrink-0 text-on-surface-variant text-xs pt-0.5">Detail</span>
            <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-outline-variant/30 flex-1 break-words">{log.detail}</span>
          </div>
        )}
      </div>

      {/* Right: note + bookmark */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Note</p>
          <button onClick={() => onToggleBookmark(log.id)}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border transition-all ${isBookmarked ? "bg-amber-50 text-amber-700 border-amber-200" : "border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${isBookmarked ? 1 : 0}` }}>bookmark</span>
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
              placeholder="Add a note about this event…"
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            <div className="flex gap-2">
              <button onClick={saveNote} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold">Save</button>
              <button onClick={() => { setEditing(false); setDraft(note || ""); }} className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} className="min-h-[60px] bg-white border border-outline-variant/40 rounded-lg px-3 py-2 text-sm cursor-text hover:border-primary/50 transition-colors">
            {note ? <span className="text-on-surface">{note}</span> : <span className="text-on-surface-variant italic text-xs">Click to add a note…</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ stats, loading }) {
  if (loading) return <Spinner />;
  if (!stats) return <div className="text-center py-20 text-on-surface-variant">No analytics data</div>;

  const maxHourly = Math.max(...stats.hourly_distribution.map((h) => h.count), 1);
  const maxUser = stats.top_users[0]?.count || 1;
  const maxAction = stats.top_actions[0]?.count || 1;
  const maxTrend = Math.max(...stats.trend.map((t) => t.count), 1);

  const sevColors = { critical: "text-red-600 bg-red-50", high: "text-orange-600 bg-orange-50", medium: "text-amber-600 bg-amber-50", low: "text-blue-600 bg-blue-50", info: "text-slate-600 bg-slate-50" };
  const sevBarColors = { critical: "bg-red-500", high: "bg-orange-400", medium: "bg-amber-400", low: "bg-blue-400", info: "bg-slate-300" };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events",    value: stats.total,                                             icon: "history",   color: "text-primary",    bg: "bg-primary/5" },
          { label: "Critical + High", value: (stats.severity_counts.critical || 0) + (stats.severity_counts.high || 0), icon: "warning", color: "text-red-600", bg: "bg-red-50" },
          { label: "Unique Users",    value: stats.top_users.length,                                  icon: "group",     color: "text-teal-600",   bg: "bg-teal-50" },
          { label: "Action Types",    value: stats.top_actions.length,                                icon: "category",  color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-[18px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div>
              <p className="text-xl font-extrabold">{value}</p>
              <p className="text-[11px] text-on-surface-variant">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hourly heatmap */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
          <h3 className="font-extrabold text-sm">Activity by Hour of Day</h3>
          <div className="grid grid-cols-12 gap-1">
            {stats.hourly_distribution.map(({ hour, count }) => {
              const intensity = maxHourly > 0 ? count / maxHourly : 0;
              const bg = intensity === 0 ? "bg-surface-container" : intensity < 0.25 ? "bg-primary/20" : intensity < 0.5 ? "bg-primary/40" : intensity < 0.75 ? "bg-primary/70" : "bg-primary";
              return (
                <div key={hour} title={`${String(hour).padStart(2, "0")}:00 — ${count} events`}
                  className={`${bg} rounded aspect-square flex items-end justify-center pb-0.5 cursor-default transition-colors relative group`}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                    {String(hour).padStart(2, "0")}:00 · {count}
                  </div>
                  <span className="text-[9px] text-on-surface-variant">{hour}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
            <span>Low</span>
            <div className="flex gap-0.5">
              {["bg-surface-container", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary"].map((c) => (
                <div key={c} className={`w-4 h-2 rounded ${c}`} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>

        {/* Severity distribution */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
          <h3 className="font-extrabold text-sm">Severity Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.severity_counts).map(([sev, count]) => {
              const maxSev = Math.max(...Object.values(stats.severity_counts), 1);
              return (
                <div key={sev} className="flex items-center gap-3">
                  <SevBadge severity={sev} />
                  <div className="flex-1">
                    <MiniBar value={count} max={maxSev} color={sevBarColors[sev]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top users */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
          <h3 className="font-extrabold text-sm">Most Active Users</h3>
          {stats.top_users.length === 0 ? (
            <p className="text-on-surface-variant text-sm py-4 text-center">No user data</p>
          ) : (
            <div className="space-y-3">
              {stats.top_users.map((u, i) => (
                <div key={u.user_id} className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-on-surface-variant w-4">{i + 1}</span>
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold truncate">{u.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_COLORS[u.role] || "bg-slate-100 text-slate-600"}`}>{u.role}</span>
                  </div>
                  <div className="flex-1">
                    <MiniBar value={u.count} max={maxUser} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top actions */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
          <h3 className="font-extrabold text-sm">Top Action Types</h3>
          <div className="space-y-2.5">
            {stats.top_actions.map(({ action, count }) => (
              <div key={action} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant w-5 shrink-0">{actionIcon(action)}</span>
                <span className="text-xs w-28 shrink-0 truncate font-semibold">{action}</span>
                <div className="flex-1">
                  <MiniBar value={count} max={maxAction} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14-day trend */}
      <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
        <h3 className="font-extrabold text-sm">14-Day Activity Trend</h3>
        <div className="flex items-end gap-1" style={{ height: 100 }}>
          {stats.trend.map((t) => {
            const pct = maxTrend > 0 ? (t.count / maxTrend) * 100 : 0;
            return (
              <div key={t.date} className="flex-1 flex flex-col items-center group relative" style={{ height: "100%" }}>
                <div className="flex-1 flex items-end w-full">
                  <div className="w-full bg-primary/20 group-hover:bg-primary rounded-t transition-all"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${t.date}: ${t.count} events`} />
                </div>
                <span className="text-[9px] text-on-surface-variant mt-1 rotate-45 origin-left whitespace-nowrap">{t.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Timeline view ─────────────────────────────────────────────────────────────
function TimelineView({ logs, bookmarks, notes, onToggleBookmark, onSaveNote }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-0">
      {logs.map((log, i) => {
        const s = SEVERITY[log.severity] ?? SEVERITY.info;
        const isLast = i === logs.length - 1;
        return (
          <div key={log.id} className="flex gap-4">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${s.dot} ring-2 ring-white`} />
              {!isLast && <div className="w-0.5 flex-1 bg-outline-variant/30 my-1" />}
            </div>

            {/* Content */}
            <div className={`flex-1 mb-3 bg-white rounded-xl border border-outline-variant/30 overflow-hidden ${s.row}`}>
              <button className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-container-low/40"
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SevBadge severity={log.severity} />
                    <span className="text-xs font-bold">{log.action}</span>
                    {log.user_name && <span className="text-xs text-on-surface-variant">by {log.user_name}</span>}
                    {bookmarks[log.id] && <span className="material-symbols-outlined text-amber-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {log.resource}{log.resource_id ? ` #${log.resource_id}` : ""}{log.detail ? ` · ${log.detail.slice(0, 60)}${log.detail.length > 60 ? "…" : ""}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-on-surface-variant whitespace-nowrap shrink-0">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                </span>
              </button>
              {expanded === log.id && (
                <ExpandedRow log={log} note={notes[log.id]} onSaveNote={(n) => onSaveNote(log.id, n)}
                  isBookmarked={!!bookmarks[log.id]} onToggleBookmark={onToggleBookmark} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

export default function ActivityLogs() {
  const [tab, setTab] = useState("logs");
  const [viewMode, setViewMode] = useState("table");
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [liveRefresh, setLiveRefresh] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [pendingLogs, setPendingLogs] = useState([]);
  const latestIdRef = useRef(0);

  const [filters, setFilters] = useState({
    search: "", severity: "all", role: "all", action: "all", dateFrom: "", dateTo: "",
  });
  const [bookmarksOnly, setBookmarksOnly] = useState(false);

  const [bookmarks, setBookmarks] = useLocalObj("log_bookmarks");
  const [notes, setNotes] = useLocalObj("log_notes");

  // Collect unique action types from loaded logs
  const actionTypes = ["all", ...Array.from(new Set(logs.map((l) => l.action).filter(Boolean))).sort()];

  function setFilter(key, val) {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(0);
  }

  const buildParams = useCallback(() => ({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    ...(filters.action !== "all" ? { action: filters.action } : {}),
    ...(filters.severity !== "all" ? { severity: filters.severity } : {}),
    ...(filters.role !== "all" ? { role: filters.role } : {}),
    ...(filters.dateFrom ? { date_from: filters.dateFrom } : {}),
    ...(filters.dateTo ? { date_to: filters.dateTo } : {}),
  }), [filters, page]);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    getActivityLogs(buildParams())
      .then((r) => {
        const items = r.data?.items ?? [];
        const tot = r.data?.total ?? items.length;
        if (silent && items.length > 0) {
          const latestNew = items[0]?.id ?? 0;
          if (latestIdRef.current > 0 && latestNew > latestIdRef.current) {
            const nc = items.filter((l) => l.id > latestIdRef.current).length;
            setPendingLogs(items.filter((l) => l.id > latestIdRef.current));
            setNewCount(nc);
          } else {
            setLogs(items);
            setTotal(tot);
          }
          latestIdRef.current = latestNew;
        } else {
          setLogs(items);
          setTotal(tot);
          if (items.length > 0) latestIdRef.current = items[0].id ?? 0;
        }
      })
      .catch(() => {})
      .finally(() => { if (!silent) setLoading(false); });
  }, [buildParams]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    getActivityLogStats(30)
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === "analytics" && !stats) loadStats();
  }, [tab, stats, loadStats]);

  useEffect(() => {
    if (!liveRefresh) return;
    const id = setInterval(() => load(true), 30000);
    return () => clearInterval(id);
  }, [liveRefresh, load]);

  function applyPending() {
    setLogs((prev) => [...pendingLogs, ...prev]);
    setNewCount(0);
    setPendingLogs([]);
  }

  function toggleBookmark(id) {
    setBookmarks((b) => {
      const next = { ...b };
      if (next[id]) delete next[id]; else next[id] = true;
      return next;
    });
  }

  function saveNote(id, text) {
    setNotes((n) => {
      const next = { ...n };
      if (!text) delete next[id]; else next[id] = text;
      return next;
    });
  }

  // Client-side search filter (applied on top of server filters)
  const filtered = logs.filter((l) => {
    if (bookmarksOnly && !bookmarks[l.id]) return false;
    const q = filters.search.toLowerCase();
    if (!q) return true;
    return [l.action, l.resource, l.user_name, l.user_role, l.detail, l.ip_address, String(l.user_id ?? "")]
      .join(" ").toLowerCase().includes(q);
  });

  const bookmarkedLogs = logs.filter((l) => bookmarks[l.id]);

  function exportCSV(rows) {
    const header = "id,severity,action,user_id,user_name,user_role,resource,resource_id,detail,ip_address,created_at";
    const csvRows = rows.map((l) =>
      [l.id, l.severity, l.action, l.user_id, l.user_name, l.user_role, l.resource, l.resource_id,
        `"${(l.detail || "").replace(/"/g, '""')}"`, l.ip_address, l.created_at].join(",")
    );
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Activity Logs</h1>
            <p className="text-on-surface-variant mt-1">Audit trail, security monitoring, and behavioral analytics</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* New entries notification */}
            {newCount > 0 && (
              <button onClick={applyPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold animate-pulse">
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                {newCount} new
              </button>
            )}
            <button onClick={() => setLiveRefresh((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${liveRefresh ? "bg-emerald-500 text-white border-emerald-500" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"}`}>
              <span className="material-symbols-outlined text-[15px]">sensors</span>
              Live {liveRefresh ? "ON" : "OFF"}
            </button>
            <button onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[15px]">download</span>CSV
            </button>
            <button onClick={() => load()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit flex-wrap">
          {[
            ["logs",      "history",   "Logs"],
            ["analytics", "bar_chart", "Analytics"],
            ["bookmarks", "bookmark",  `Bookmarks${Object.keys(bookmarks).length > 0 ? ` (${Object.keys(bookmarks).length})` : ""}`],
          ].map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-white shadow text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
              <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
            </button>
          ))}
        </div>

        {/* Analytics tab */}
        {tab === "analytics" && <AnalyticsTab stats={stats} loading={statsLoading} />}

        {/* Bookmarks tab */}
        {tab === "bookmarks" && (
          <div className="space-y-4">
            {bookmarkedLogs.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">bookmark_border</span>
                No bookmarked logs yet. Open any log entry and click Bookmark.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden">
                {bookmarkedLogs.map((log) => {
                  const s = SEVERITY[log.severity] ?? SEVERITY.info;
                  return (
                    <div key={log.id} className={`border-b border-outline-variant/20 last:border-0 px-4 py-3 flex items-start gap-3 ${s.row}`}>
                      <SevBadge severity={log.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{log.action}</span>
                          {log.user_name && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ROLE_COLORS[log.user_role] || "bg-slate-100 text-slate-600"}`}>{log.user_name}</span>}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {log.resource}{log.resource_id ? ` #${log.resource_id}` : ""}{log.detail ? ` · ${log.detail.slice(0, 80)}` : ""}
                        </p>
                        {notes[log.id] && (
                          <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">sticky_note_2</span>{notes[log.id]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-on-surface-variant">{log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</span>
                        <button onClick={() => toggleBookmark(log.id)} title="Remove bookmark"
                          className="text-amber-500 hover:text-slate-400 transition-colors">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Logs tab */}
        {tab === "logs" && (
          <div className="space-y-4">
            {/* Sticky filters */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border border-outline-variant/30 rounded-xl p-3 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined text-on-surface-variant absolute left-2.5 top-2.5 text-[15px]">search</span>
                  <input value={filters.search} onChange={(e) => setFilter("search", e.target.value)}
                    placeholder="Search…"
                    className="border border-outline-variant rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary w-44" />
                </div>

                {/* Severity */}
                <select value={filters.severity} onChange={(e) => setFilter("severity", e.target.value)}
                  className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="all">All severity</option>
                  {Object.entries(SEVERITY).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                </select>

                {/* Role */}
                <select value={filters.role} onChange={(e) => setFilter("role", e.target.value)}
                  className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="all">All roles</option>
                  {["super_admin", "hotel_admin", "staff", "guest"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                {/* Action */}
                <select value={filters.action} onChange={(e) => setFilter("action", e.target.value)}
                  className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary max-w-[160px]">
                  {actionTypes.map((a) => <option key={a} value={a}>{a === "all" ? "All actions" : a}</option>)}
                </select>

                {/* Date range */}
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)}
                  className="border border-outline-variant rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-primary" />
                <span className="text-xs text-on-surface-variant">to</span>
                <input type="date" value={filters.dateTo} onChange={(e) => setFilter("dateTo", e.target.value)}
                  className="border border-outline-variant rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-primary" />

                {/* Bookmark filter */}
                <button onClick={() => setBookmarksOnly((v) => !v)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${bookmarksOnly ? "bg-amber-50 text-amber-700 border-amber-200" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"}`}>
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${bookmarksOnly ? 1 : 0}` }}>bookmark</span>
                  Saved
                </button>

                {/* View mode */}
                <div className="ml-auto flex gap-1 bg-surface-container rounded-lg p-0.5">
                  {[["table", "table_rows"], ["timeline", "view_timeline"]].map(([m, icon]) => (
                    <button key={m} onClick={() => setViewMode(m)}
                      className={`p-1.5 rounded transition-all ${viewMode === m ? "bg-white shadow text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </button>
                  ))}
                </div>

                {/* Clear */}
                {(filters.search || filters.severity !== "all" || filters.role !== "all" || filters.action !== "all" || filters.dateFrom || filters.dateTo || bookmarksOnly) && (
                  <button onClick={() => { setFilters({ search: "", severity: "all", role: "all", action: "all", dateFrom: "", dateTo: "" }); setBookmarksOnly(false); setPage(0); }}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">close</span>Clear
                  </button>
                )}
              </div>

              {/* Result count */}
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">{filtered.length}</span> shown
                {total > 0 && <span>· {total} total in DB</span>}
                {Object.keys(bookmarks).length > 0 && <span>· {Object.keys(bookmarks).length} bookmarked</span>}
              </div>
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">No logs match your filters</div>
            ) : viewMode === "timeline" ? (
              <TimelineView logs={filtered} bookmarks={bookmarks} notes={notes}
                onToggleBookmark={toggleBookmark} onSaveNote={saveNote} />
            ) : (
              <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low">
                      <tr>
                        {["Severity", "Time", "User", "Action", "Resource", "Detail", "IP", ""].map((h) => (
                          <th key={h} className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((log) => {
                        const s = SEVERITY[log.severity] ?? SEVERITY.info;
                        const isExp = expandedId === log.id;
                        return (
                          <>
                            <tr key={log.id}
                              className={`border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container-low/40 transition-colors ${s.row} ${isExp ? "bg-surface-container-low/60" : ""}`}
                              onClick={() => setExpandedId(isExp ? null : log.id)}>
                              <td className="px-3 py-2.5"><SevBadge severity={log.severity} /></td>
                              <td className="px-3 py-2.5 text-[11px] text-on-surface-variant whitespace-nowrap">
                                {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                              </td>
                              <td className="px-3 py-2.5">
                                {log.user_name ? (
                                  <div>
                                    <p className="text-xs font-semibold">{log.user_name}</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_COLORS[log.user_role] || "bg-slate-100 text-slate-500"}`}>{log.user_role || "—"}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-on-surface-variant">{log.user_id ? `#${log.user_id}` : "system"}</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="inline-flex items-center gap-1 text-xs font-bold">
                                  <span className="material-symbols-outlined text-[13px] text-on-surface-variant">{actionIcon(log.action)}</span>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-[11px] text-on-surface-variant">
                                {log.resource}{log.resource_id ? <span className="font-mono ml-1 opacity-60">#{log.resource_id}</span> : null}
                              </td>
                              <td className="px-3 py-2.5 text-[11px] text-on-surface-variant max-w-[180px]">
                                <span className="truncate block">{log.detail || "—"}</span>
                              </td>
                              <td className="px-3 py-2.5 text-[11px] text-on-surface-variant font-mono whitespace-nowrap">{log.ip_address || "—"}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1">
                                  {bookmarks[log.id] && (
                                    <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                                  )}
                                  {notes[log.id] && (
                                    <span className="material-symbols-outlined text-blue-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>sticky_note_2</span>
                                  )}
                                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">{isExp ? "expand_less" : "expand_more"}</span>
                                </div>
                              </td>
                            </tr>
                            {isExp && (
                              <tr key={`${log.id}-exp`} className="border-b border-outline-variant/10">
                                <td colSpan={8} className="p-0">
                                  <ExpandedRow log={log} note={notes[log.id]}
                                    onSaveNote={(n) => saveNote(log.id, n)}
                                    isBookmarked={!!bookmarks[log.id]}
                                    onToggleBookmark={toggleBookmark} />
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low/30">
                    <span className="text-xs text-on-surface-variant">Page {page + 1} of {totalPages} ({total} total)</span>
                    <div className="flex gap-1">
                      <button onClick={() => setPage(0)} disabled={page === 0}
                        className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-white border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px]">first_page</span>
                      </button>
                      <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                        className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-white border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                        const p = start + i;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded text-xs border ${p === page ? "bg-primary text-white border-primary" : "border-outline-variant hover:bg-white"}`}>
                            {p + 1}
                          </button>
                        );
                      })}
                      <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                        className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-white border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                      <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                        className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-white border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px]">last_page</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
