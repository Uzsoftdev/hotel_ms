import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getActivityLogs } from "../../../services/admin";

const LIMITS = [50, 100, 250];

const ACTION_META = {
  login:      { color: "text-emerald-700 bg-emerald-50", icon: "login" },
  logout:     { color: "text-slate-600 bg-slate-100",    icon: "logout" },
  create:     { color: "text-blue-700 bg-blue-50",       icon: "add_circle" },
  update:     { color: "text-amber-700 bg-amber-50",     icon: "edit" },
  delete:     { color: "text-red-600 bg-red-50",         icon: "delete" },
  cancel:     { color: "text-orange-600 bg-orange-50",   icon: "cancel" },
  ban:        { color: "text-red-700 bg-red-100",        icon: "block" },
  error:      { color: "text-red-700 bg-red-100",        icon: "error" },
  fail:       { color: "text-red-700 bg-red-100",        icon: "error" },
  view:       { color: "text-violet-700 bg-violet-50",   icon: "visibility" },
  export:     { color: "text-indigo-700 bg-indigo-50",   icon: "download" },
  checkin:    { color: "text-teal-700 bg-teal-50",       icon: "check_circle" },
  checkout:   { color: "text-cyan-700 bg-cyan-50",       icon: "logout" },
  payment:    { color: "text-green-700 bg-green-50",     icon: "payments" },
};

const SECURITY_ACTIONS = ["ban", "error", "fail", "delete", "login_fail", "unauthorized"];

function getActionMeta(action = "") {
  const key = Object.keys(ACTION_META).find((k) => action.toLowerCase().includes(k));
  return ACTION_META[key] ?? { color: "text-on-surface-variant bg-surface-container", icon: "radio_button_unchecked" };
}

function isSecurityEvent(log) {
  return SECURITY_ACTIONS.some((k) => (log.action ?? "").toLowerCase().includes(k));
}

function downloadCSV(logs) {
  const header = "id,user_id,action,resource,resource_id,detail,ip_address,created_at";
  const rows = logs.map((l) =>
    [l.id, l.user_id, l.action, l.resource, l.resource_id, `"${(l.detail || "").replace(/"/g, '""')}"`, l.ip_address, l.created_at].join(",")
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function Spinner() {
  return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [securityOnly, setSecurityOnly] = useState(false);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 25;

  const load = useCallback(() => {
    setLoading(true);
    getActivityLogs(limit)
      .then((r) => { setLogs(r.data); setPage(0); })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  const actionTypes = ["all", ...Array.from(new Set(logs.map((l) => l.action).filter(Boolean))).sort()];

  const filtered = logs.filter((l) => {
    if (securityOnly && !isSecurityEvent(l)) return false;
    if (filterAction !== "all" && l.action !== filterAction) return false;
    if (filterDate) {
      const logDate = l.created_at ? l.created_at.slice(0, 10) : "";
      if (logDate !== filterDate) return false;
    }
    const q = search.toLowerCase();
    if (q) {
      const haystack = [l.action, l.resource, String(l.user_id ?? ""), l.detail ?? "", l.ip_address ?? ""].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const secCount = logs.filter(isSecurityEvent).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Activity Logs</h1>
            <p className="text-on-surface-variant mt-1">Audit trail of all admin and user actions</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setSecurityOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${securityOnly ? "bg-red-500 text-white border-red-500" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"}`}>
              <span className="material-symbols-outlined text-[15px]">security</span>
              Security {secCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${securityOnly ? "bg-white/30 text-white" : "bg-red-100 text-red-600"}`}>{secCount}</span>}
            </button>
            <button onClick={() => downloadCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[15px]">download</span>CSV
            </button>
            <button onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[15px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[16px]">search</span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search logs…"
              className="border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-52" />
          </div>

          {/* Action filter */}
          <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
            className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
            {actionTypes.map((a) => <option key={a} value={a}>{a === "all" ? "All actions" : a}</option>)}
          </select>

          {/* Date filter */}
          <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(0); }}
            className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />

          {(filterAction !== "all" || filterDate || search || securityOnly) && (
            <button onClick={() => { setFilterAction("all"); setFilterDate(""); setSearch(""); setSecurityOnly(false); setPage(0); }}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">close</span>Clear filters
            </button>
          )}

          {/* Limit picker */}
          <div className="ml-auto flex gap-1">
            {LIMITS.map((l) => (
              <button key={l} onClick={() => setLimit(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${limit === l ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Summary chips */}
        {!loading && (
          <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
            <span className="font-semibold text-on-surface">{filtered.length.toLocaleString()}</span> results
            {filtered.length !== logs.length && <span>of {logs.length.toLocaleString()} loaded</span>}
            {secCount > 0 && !securityOnly && (
              <button onClick={() => setSecurityOnly(true)} className="text-red-600 font-bold hover:underline flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">warning</span>{secCount} security events
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? <Spinner /> : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Time", "User", "Action", "Resource", "Detail"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paged.map((l, i) => {
                  const meta = getActionMeta(l.action);
                  const security = isSecurityEvent(l);
                  return (
                    <tr key={l.id ?? i} className={`group hover:bg-surface-container-low/40 transition-colors ${security ? "bg-red-50/40" : ""}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {security && <span className="material-symbols-outlined text-red-500 text-[14px] shrink-0">warning</span>}
                          <span className="text-xs text-on-surface-variant">{l.created_at ? new Date(l.created_at).toLocaleString() : "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold">
                        {l.user_id ? <span className="bg-surface-container px-2 py-0.5 rounded font-mono">#{l.user_id}</span> : <span className="text-on-surface-variant">system</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${meta.color}`}>
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                          {l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">
                        {l.resource && (
                          <span>{l.resource}{l.resource_id ? <span className="font-mono text-[10px] ml-1 text-on-surface-variant/60">#{l.resource_id}</span> : null}</span>
                        )}
                        {!l.resource && "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant max-w-xs">
                        <span className="truncate block">{l.detail || "—"}</span>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-14 text-center text-on-surface-variant">
                    {search || filterAction !== "all" || filterDate || securityOnly ? "No logs match your filters" : "No activity logs found"}
                  </td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
                <span className="text-xs text-on-surface-variant">
                  Page {page + 1} of {totalPages} ({filtered.length} results)
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(0)} disabled={page === 0}
                    className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-surface-container-low border border-outline-variant">
                    <span className="material-symbols-outlined text-[14px]">first_page</span>
                  </button>
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-surface-container-low border border-outline-variant">
                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                    const p = start + idx;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`px-3 py-1 rounded text-xs border ${p === page ? "bg-primary text-white border-primary" : "border-outline-variant hover:bg-surface-container-low"}`}>
                        {p + 1}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-surface-container-low border border-outline-variant">
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                  <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                    className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-surface-container-low border border-outline-variant">
                    <span className="material-symbols-outlined text-[14px]">last_page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
