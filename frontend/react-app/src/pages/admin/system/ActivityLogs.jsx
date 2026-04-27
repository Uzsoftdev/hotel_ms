import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getActivityLogs } from "../../../services/admin";

const LIMITS = [50, 100, 250];

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getActivityLogs(limit).then((r) => setLogs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [limit]);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.action?.toLowerCase().includes(q) || l.resource?.toLowerCase().includes(q) || String(l.user_id).includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Activity Logs</h1>
            <p className="text-on-surface-variant mt-1">Audit trail of all admin and user actions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[18px]">search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter logs…"
                className="border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-52" />
            </div>
            <div className="flex gap-1">
              {LIMITS.map((l) => (
                <button key={l} onClick={() => setLimit(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${limit === l ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>{["Time", "User", "Action", "Resource", "Detail", "IP"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((l, i) => (
                  <tr key={l.id ?? i} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                      {l.created_at ? new Date(l.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">#{l.user_id || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{l.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{l.resource}{l.resource_id ? ` #${l.resource_id}` : ""}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant max-w-xs truncate">{l.detail || "—"}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{l.ip_address || "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">{search ? "No logs match your filter" : "No activity logs found"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
