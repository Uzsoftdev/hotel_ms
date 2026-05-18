import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { getUsers, updateUser, deleteUser, banUser, getUserDetail } from "../../../services/admin";

const ROLE_META = {
  super_admin: { label: "Super Admin", color: "bg-red-100 text-red-700 border border-red-200", icon: "admin_panel_settings" },
  hotel_admin: { label: "Hotel Admin", color: "bg-violet-100 text-violet-700 border border-violet-200", icon: "manage_accounts" },
  staff: { label: "Staff", color: "bg-blue-100 text-blue-700 border border-blue-200", icon: "badge" },
};

function Avatar({ name, photo }) {
  if (photo) return <img src={photo} className="w-9 h-9 rounded-full object-cover" alt="" />;
  const init = (name || "?").charAt(0).toUpperCase();
  const colors = ["bg-primary/20 text-primary", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700"];
  const c = colors[(init.charCodeAt(0) || 0) % colors.length];
  return <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${c}`}>{init}</div>;
}

function DetailPanel({ staffId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!staffId) return;
    setLoading(true);
    getUserDetail(staffId).then((r) => setDetail(r.data)).catch(() => setDetail(null)).finally(() => setLoading(false));
  }, [staffId]);

  const STATUS_STYLE = { confirmed: "text-emerald-600", pending: "text-amber-600", cancelled: "text-red-500", completed: "text-blue-600" };

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-lg">Staff Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">Failed to load</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={detail.user.full_name} photo={detail.user.photo_url} />
              <div>
                <p className="font-bold text-lg">{detail.user.full_name || "Staff"}</p>
                <p className="text-on-surface-variant text-sm">{detail.user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const m = ROLE_META[detail.user.role] || ROLE_META.staff;
                return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${m.color}`}>
                    <span className="material-symbols-outlined text-[13px]">{m.icon}</span>{m.label}
                  </span>
                );
              })()}
              {detail.user.department && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="material-symbols-outlined text-[13px]">apartment</span>{detail.user.department}
                </span>
              )}
              {detail.user.is_banned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                  <span className="material-symbols-outlined text-[13px]">block</span>Suspended
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Bookings Handled", detail.stats.total_bookings, "book_online"],
                ["Revenue Processed", `$${detail.stats.total_spent.toFixed(0)}`, "payments"],
              ].map(([label, val, icon]) => (
                <div key={label} className="bg-surface-container-low rounded-xl p-4">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
                  <p className="text-xl font-extrabold mt-1">{val}</p>
                  <p className="text-xs text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              {detail.user.phone && <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Phone</span><span className="font-semibold">{detail.user.phone}</span></div>}
              {detail.user.notes && <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Notes</span><span className="font-semibold">{detail.user.notes}</span></div>}
              <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Joined</span><span className="font-semibold">{detail.user.created_at ? new Date(detail.user.created_at).toLocaleDateString() : "—"}</span></div>
            </div>
            {detail.stats.recent_bookings.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Recent Activity</p>
                <div className="space-y-2">
                  {detail.stats.recent_bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold">Booking #{b.id}</p>
                        <p className="text-xs text-on-surface-variant">{b.check_in} → {b.check_out}</p>
                      </div>
                      <p className={`text-xs font-bold capitalize ${STATUS_STYLE[b.status] || "text-on-surface-variant"}`}>{b.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffAccounts() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [detailId, setDetailId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  function reload() {
    setLoading(true);
    setError(null);
    Promise.all([getUsers("super_admin"), getUsers("hotel_admin"), getUsers("staff")])
      .then(([sa, ha, s]) => setStaff([...sa.data, ...ha.data, ...s.data]))
      .catch((e) => setError("Failed to load staff: " + (e.response?.data?.detail || e.message)))
      .finally(() => setLoading(false));
  }
  useEffect(reload, []);

  async function handleRoleChange(id, role) {
    setActing(id);
    try {
      const r = await updateUser(id, { role });
      setStaff((prev) => prev.map((s) => s.id === id ? { ...s, ...r.data } : s));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleEdit(id) {
    setActing(id);
    try {
      const r = await updateUser(id, editForm);
      setStaff((prev) => prev.map((s) => s.id === id ? { ...s, ...r.data } : s));
      setEditingId(null);
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleBan(id, isBanned) {
    if (!confirm(isBanned ? "Unsuspend this staff member?" : "Suspend this staff member's access?")) return;
    setActing(id);
    try {
      const r = await banUser(id, !isBanned, isBanned ? null : "Admin suspended");
      setStaff((prev) => prev.map((s) => s.id === id ? { ...s, ...r.data } : s));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleDelete(id) {
    if (!confirm("Permanently delete this staff account?")) return;
    setActing(id);
    try {
      await deleteUser(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (s.full_name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
    const matchRole = filterRole === "all" || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const byRole = { super_admin: 0, hotel_admin: 0, staff: 0 };
  staff.forEach((s) => { if (byRole[s.role] !== undefined) byRole[s.role]++; });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Staff Accounts</h1>
            <p className="text-on-surface-variant mt-1">{staff.length} team member{staff.length !== 1 ? "s" : ""}</p>
          </div>
          <Link to="/admin/users/add" className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_add</span>Add Staff
          </Link>
        </div>

        {/* Role breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(ROLE_META).map(([role, meta]) => (
            <div key={role} className={`rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${filterRole === role ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-white hover:bg-surface-container-low"}`}
              onClick={() => setFilterRole(filterRole === role ? "all" : role)}>
              <span className={`material-symbols-outlined text-[26px] ${meta.color.split(" ")[1]}`} style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
              <div>
                <p className="text-2xl font-extrabold">{byRole[role]}</p>
                <p className="text-xs text-on-surface-variant">{meta.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search / filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2 text-[18px]">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff…"
              className="w-full border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        {/* Error banner */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">{error}</p>
              <button onClick={reload} className="mt-2 text-xs font-bold text-red-600 underline">Retry</button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : !error && (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Staff Member", "Role", "Department", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((s) => {
                  const meta = ROLE_META[s.role] || ROLE_META.staff;
                  const isEditing = editingId === s.id;
                  return (
                    <tr key={s.id} className={`hover:bg-surface-container-low/50 transition-colors ${s.is_banned ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetailId(s.id)} className="flex items-center gap-2.5 hover:text-primary transition-colors text-left">
                          <Avatar name={s.full_name} photo={s.photo_url} />
                          <div>
                            <p className="font-semibold">{s.full_name || "—"}</p>
                            <p className="text-xs text-on-surface-variant">{s.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <select value={s.role} disabled={acting === s.id} onChange={(e) => handleRoleChange(s.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${meta.color}`}>
                          {["staff", "hotel_admin", "super_admin"].map((r) => (
                            <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input value={editForm.department || ""} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
                            className="border border-primary rounded-lg px-2 py-1 text-xs w-32 focus:outline-none" placeholder="Department" />
                        ) : (
                          <span className="text-on-surface-variant text-xs">{s.department || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.is_banned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                            <span className="material-symbols-outlined text-[11px]">block</span>Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                            <span className="material-symbols-outlined text-[11px]">check_circle</span>Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(s.id)} disabled={acting === s.id}
                              className="px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50">Save</button>
                            <button onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 rounded-lg border border-outline-variant text-xs font-semibold hover:bg-surface-container-low">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDetailId(s.id)} title="View profile"
                              className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[16px]">person</span>
                            </button>
                            <button onClick={() => { setEditingId(s.id); setEditForm({ department: s.department || "", notes: s.notes || "" }); }}
                              title="Edit" className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => handleBan(s.id, s.is_banned)} disabled={acting === s.id} title={s.is_banned ? "Unsuspend" : "Suspend"}
                              className={`p-1.5 rounded-lg hover:bg-red-50 transition-colors ${s.is_banned ? "text-amber-500" : "text-on-surface-variant hover:text-red-500"}`}>
                              <span className="material-symbols-outlined text-[16px]">{s.is_banned ? "lock_open" : "lock"}</span>
                            </button>
                            <button onClick={() => handleDelete(s.id)} disabled={acting === s.id} title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-on-surface-variant">
                    {search || filterRole !== "all" ? "No staff match your filters" : "No staff accounts yet"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {detailId && <DetailPanel staffId={detailId} onClose={() => setDetailId(null)} />}
    </AdminLayout>
  );
}
