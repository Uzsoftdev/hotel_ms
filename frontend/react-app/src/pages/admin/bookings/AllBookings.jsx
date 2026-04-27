import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getAllBookings, updateBookingStatus } from "../../../services/admin";

const STATUS_COLOR = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-600", completed: "bg-blue-100 text-blue-700" };
const TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllBookings(tab === "all" ? null : tab).then((r) => setBookings(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  async function handleStatus(id, status) {
    setUpdating(id);
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setUpdating(null); }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">All Bookings</h1>
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${tab === t ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"}`}>{t}</button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>{["ID", "Guest", "Room", "Check-in", "Check-out", "Total", "Status", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 font-semibold">#{b.id}</td>
                    <td className="px-4 py-3"><div className="font-semibold">{b.guest_name || "—"}</div><div className="text-xs text-on-surface-variant">{b.guest_email}</div></td>
                    <td className="px-4 py-3">#{b.room_id}</td>
                    <td className="px-4 py-3">{b.check_in}</td>
                    <td className="px-4 py-3">{b.check_out}</td>
                    <td className="px-4 py-3 font-bold">${Number(b.total_price).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100"}`}>{b.status}</span></td>
                    <td className="px-4 py-3">
                      <select disabled={updating === b.id} value={b.status} onChange={(e) => handleStatus(b.id, e.target.value)} className="text-xs border border-outline-variant rounded px-2 py-1 bg-white focus:outline-none focus:border-primary">
                        {["pending","confirmed","completed","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">No bookings found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
