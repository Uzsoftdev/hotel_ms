import { useEffect, useState } from "react";
import StaffLayout from "./Layout/StaffLayout";
import { getAssignedBookings } from "../../services/staff";

const STATUS_COLOR = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", completed: "bg-blue-100 text-blue-700", cancelled: "bg-red-100 text-red-600" };
const TABS = ["all", "pending", "confirmed", "completed"];

export default function AssignedBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("confirmed");

  useEffect(() => {
    setLoading(true);
    getAssignedBookings(tab === "all" ? null : tab)
      .then((r) => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Assigned Bookings</h1>
          <p className="text-on-surface-variant mt-1">View and manage guest bookings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${tab === t ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"}`}>
              {t}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold">Booking #{b.id} — {b.guest_name || `Guest #${b.user_id}`}</p>
                  <p className="text-sm text-on-surface-variant">Room #{b.room_id} · {b.check_in} → {b.check_out}</p>
                  {b.guest_email && <p className="text-xs text-on-surface-variant">{b.guest_email}</p>}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100"}`}>{b.status}</span>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="bg-white rounded-xl border border-outline-variant/30 py-20 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">book_online</span>
                <p className="font-semibold text-on-surface-variant">No bookings in this status</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
