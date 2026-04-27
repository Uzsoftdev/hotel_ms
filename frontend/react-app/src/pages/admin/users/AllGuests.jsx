import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getUsers, deleteUser } from "../../../services/admin";

export default function AllGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getUsers("guest").then((r) => setGuests(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this guest account? All their data will be removed.")) return;
    setDeleting(id);
    try {
      await deleteUser(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setDeleting(null); }
  }

  const filtered = guests.filter((g) => {
    const q = search.toLowerCase();
    return !q || g.full_name?.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">All Guests</h1>
            <p className="text-on-surface-variant mt-1">{guests.length} registered guest{guests.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[18px]">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guests…"
              className="border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-60" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>{["Name", "Email", "Phone", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 font-semibold">{g.full_name || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{g.email}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{g.phone || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{g.created_at ? new Date(g.created_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(g.id)} disabled={deleting === g.id} className="text-red-500 hover:underline text-xs font-semibold disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">{search ? "No guests match your search" : "No guests yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
