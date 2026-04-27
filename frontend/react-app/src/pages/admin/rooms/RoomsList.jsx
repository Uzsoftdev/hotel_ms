import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { getAdminRooms, deleteRoom, updateRoom } from "../../../services/rooms";

const STATUS_COLOR = { available: "bg-green-100 text-green-700", occupied: "bg-blue-100 text-blue-700", maintenance: "bg-yellow-100 text-yellow-700", inactive: "bg-gray-100 text-gray-500" };

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    getAdminRooms().then((r) => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleToggleActive(room) {
    setActing(room.id);
    try {
      const updated = await updateRoom(room.id, { ...room, is_active: !room.is_active });
      setRooms((prev) => prev.map((r) => r.id === room.id ? updated.data : r));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    setActing(id);
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Rooms</h1>
            <p className="text-on-surface-variant mt-1">{rooms.length} room{rooms.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link to="/admin/rooms/add" className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>Add Room
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>{["Room #", "Type", "Floor", "Capacity", "Base Price", "Status", "Active", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 font-bold">#{r.room_number}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.room_type_name || r.room_type_id || "—"}</td>
                    <td className="px-4 py-3">{r.floor ?? "—"}</td>
                    <td className="px-4 py-3">{r.capacity ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold">${Number(r.base_price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[r.status] || "bg-gray-100 text-gray-500"}`}>{r.status || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(r)} disabled={acting === r.id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${r.is_active ? "bg-primary" : "bg-outline-variant"}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${r.is_active ? "translate-x-4" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/rooms/${r.id}/edit`} className="text-primary hover:underline text-xs font-semibold">Edit</Link>
                        <button onClick={() => handleDelete(r.id)} disabled={acting === r.id} className="text-red-500 hover:underline text-xs font-semibold disabled:opacity-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">
                    No rooms found. <Link to="/admin/rooms/add" className="text-primary font-semibold hover:underline">Add one</Link>.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
