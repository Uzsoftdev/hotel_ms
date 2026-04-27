import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { getUsers, updateUser, deleteUser } from "../../../services/admin";

const ROLE_COLOR = { admin: "bg-purple-100 text-purple-700", staff: "bg-blue-100 text-blue-700", super_admin: "bg-red-100 text-red-700" };

export default function StaffAccounts() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    Promise.all([getUsers("admin"), getUsers("staff")])
      .then(([admins, staffRes]) => setStaff([...admins.data, ...staffRes.data]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id, role) {
    setActing(id);
    try {
      const r = await updateUser(id, { role });
      setStaff((prev) => prev.map((s) => s.id === id ? { ...s, ...r.data } : s));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this staff account?")) return;
    setActing(id);
    try {
      await deleteUser(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Staff Accounts</h1>
            <p className="text-on-surface-variant mt-1">{staff.length} admin{staff.length !== 1 ? "s" : ""} and staff members</p>
          </div>
          <Link to="/admin/users/add" className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_add</span>Add Staff
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>{["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 font-semibold">{s.full_name || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.email}</td>
                    <td className="px-4 py-3">
                      <select value={s.role} disabled={acting === s.id} onChange={(e) => handleRoleChange(s.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${ROLE_COLOR[s.role] || "bg-gray-100 text-gray-600"}`}>
                        {["staff", "admin", "super_admin"].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(s.id)} disabled={acting === s.id} className="text-red-500 hover:underline text-xs font-semibold disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">No staff accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
