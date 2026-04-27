import { useEffect, useState } from "react";
import StaffLayout from "./Layout/StaffLayout";
import { getRooms, updateRoomStatus } from "../../services/staff";

const STATUS_STYLE = {
  available: { bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", icon: "check_circle" },
  occupied:  { bg: "bg-blue-50 border-blue-200",  badge: "bg-blue-100 text-blue-700",   icon: "person" },
  maintenance: { bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: "build" },
  inactive:  { bg: "bg-gray-50 border-gray-200",  badge: "bg-gray-100 text-gray-500",   icon: "block" },
};

export default function RoomStatusBoard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    getRooms().then((r) => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleStatus(room, status) {
    setActing(room.id);
    try {
      await updateRoomStatus(room.id, { ...room, status });
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, status } : r));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  const summary = rooms.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Room Status Board</h1>
          <p className="text-on-surface-variant mt-1">Live overview and quick status updates</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(STATUS_STYLE).map(([status, { badge }]) => (
            <div key={status} className="bg-white rounded-xl border border-outline-variant/30 p-4 text-center">
              <p className="text-2xl font-extrabold">{summary[status] || 0}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize mt-1 inline-block ${badge}`}>{status}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((r) => {
              const style = STATUS_STYLE[r.status] || STATUS_STYLE.inactive;
              return (
                <div key={r.id} className={`rounded-xl border p-4 ${style.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-extrabold text-lg">#{r.room_number}</p>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{style.icon}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3">{r.room_type_name || "Room"} · Floor {r.floor ?? "—"}</p>
                  <select value={r.status} disabled={acting === r.id} onChange={(e) => handleStatus(r, e.target.value)}
                    className="w-full text-xs border border-outline-variant rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-primary disabled:opacity-50">
                    {["available", "occupied", "maintenance", "inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              );
            })}
            {rooms.length === 0 && <div className="col-span-4 py-16 text-center text-on-surface-variant">No rooms found</div>}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
