import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import UserLayout from "./Layout/UserLayout";
import { getBooking, cancelBooking } from "../../services/bookings";

const STATUS_COLOR = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-600", completed: "bg-blue-100 text-blue-700" };

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBooking(id).then((r) => setBooking(r.data)).catch(() => setError("Booking not found")).finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const res = await cancelBooking(id);
      setBooking(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <UserLayout>
      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600 font-semibold">{error}</div>
      ) : booking && (
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <Link to="/my-bookings" className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">arrow_back</span></Link>
            <h1 className="text-3xl font-extrabold">Booking #{booking.id}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLOR[booking.status] || "bg-gray-100"}`}>{booking.status}</span>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/30 divide-y divide-outline-variant/20">
            {[
              { icon: "hotel", label: "Room", value: `Room #${booking.room_id}` },
              { icon: "login", label: "Check-in", value: booking.check_in },
              { icon: "logout", label: "Check-out", value: booking.check_out },
              { icon: "payments", label: "Total Price", value: `$${Number(booking.total_price).toLocaleString()} USD` },
              { icon: "schedule", label: "Booked On", value: new Date(booking.created_at).toLocaleDateString() },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                <div><p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</p><p className="font-semibold">{value}</p></div>
              </div>
            ))}
          </div>
          {booking.status === "pending" && (
            <button onClick={handleCancel} disabled={cancelling} className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 disabled:opacity-50 transition-all">
              {cancelling ? "Cancelling…" : "Cancel Booking"}
            </button>
          )}
        </div>
      )}
    </UserLayout>
  );
}
