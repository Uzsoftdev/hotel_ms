import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getAllBookings, checkInGuest, checkOutGuest } from "../../../services/admin";

export default function CheckInOut() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    getAllBookings("confirmed").then((r) => setBookings(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handle(fn, id) {
    setActing(id);
    try { await fn(id); setBookings((prev) => prev.filter((b) => b.id !== id)); }
    catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Check-In / Check-Out</h1>
          <p className="text-on-surface-variant mt-1">Manage guest arrivals and departures</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant/30 py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">swap_horiz</span>
            <p className="font-semibold text-on-surface-variant">No confirmed bookings awaiting action</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-outline-variant/30 p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold">Booking #{b.id} — {b.guest_name || `Guest #${b.user_id}`}</p>
                  <p className="text-sm text-on-surface-variant">Room #{b.room_id} · {b.check_in} → {b.check_out}</p>
                  {b.guest_email && <p className="text-xs text-on-surface-variant">{b.guest_email}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handle(checkInGuest, b.id)} disabled={acting === b.id} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">login</span>Check In
                  </button>
                  <button onClick={() => handle(checkOutGuest, b.id)} disabled={acting === b.id} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">logout</span>Check Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
