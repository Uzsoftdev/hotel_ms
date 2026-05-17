import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getAllBookings, updateBookingStatus, checkInGuest } from "../../../services/admin";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-blue-100 text-blue-700",
};

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TodaySummary() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  useEffect(() => {
    getAllBookings()
      .then((r) => {
        const data = r.data;
        setBookings(Array.isArray(data) ? data : (data?.items ?? data?.data ?? []));
      })
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const arrivalsToday = bookings.filter(
    (b) => b.check_in === todayStr && (b.status === "confirmed" || b.status === "pending")
  );
  const departuresToday = bookings.filter(
    (b) => b.check_out === todayStr && (b.status === "confirmed" || b.status === "completed")
  );
  const pendingAll = bookings.filter((b) => b.status === "pending");

  async function handleConfirm(id) {
    setActionLoading(id + "-confirm");
    try {
      await updateBookingStatus(id, "confirmed");
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to confirm booking");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCheckIn(id) {
    setActionLoading(id + "-checkin");
    try {
      await checkInGuest(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to check in guest");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Today's Summary</h1>
          <p className="text-on-surface-variant mt-1">{formatDate(today)}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-700 text-sm font-semibold">{error}</div>
        ) : (
          <>
            {/* 3 large stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-indigo-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight_land</span>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-indigo-700">{arrivalsToday.length}</p>
                  <p className="text-sm text-on-surface-variant font-semibold mt-0.5">Arrivals Today</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-teal-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-teal-700">{departuresToday.length}</p>
                  <p className="text-sm text-on-surface-variant font-semibold mt-0.5">Departures Today</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-amber-700">{pendingAll.length}</p>
                  <p className="text-sm text-on-surface-variant font-semibold mt-0.5">Pending Approvals</p>
                </div>
              </div>
            </div>

            {/* Two tables side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Arriving Today */}
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight_land</span>
                  <h2 className="font-extrabold">Arriving Today</h2>
                  <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{arrivalsToday.length}</span>
                </div>
                {arrivalsToday.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm">No arrivals today</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {["Guest", "Room", "Status", "Total", "Actions"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {arrivalsToday.map((b) => (
                          <tr key={b.id} className="hover:bg-surface-container-low/50">
                            <td className="px-4 py-3">
                              <p className="font-semibold whitespace-nowrap">{b.guest_name || `User #${b.user_id}`}</p>
                              <p className="text-xs text-on-surface-variant">{b.guest_email}</p>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">#{b.room_id}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100"}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold">${Number(b.total_price).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                {b.status === "pending" && (
                                  <button
                                    onClick={() => handleConfirm(b.id)}
                                    disabled={actionLoading === b.id + "-confirm"}
                                    className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {actionLoading === b.id + "-confirm" ? "…" : "Confirm"}
                                  </button>
                                )}
                                {b.status === "confirmed" && (
                                  <button
                                    onClick={() => handleCheckIn(b.id)}
                                    disabled={actionLoading === b.id + "-checkin"}
                                    className="text-xs px-3 py-1 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {actionLoading === b.id + "-checkin" ? "…" : "Check In"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Departing Today */}
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                  <h2 className="font-extrabold">Departing Today</h2>
                  <span className="ml-auto text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">{departuresToday.length}</span>
                </div>
                {departuresToday.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm">No departures today</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {["Guest", "Room", "Status", "Total"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {departuresToday.map((b) => (
                          <tr key={b.id} className="hover:bg-surface-container-low/50">
                            <td className="px-4 py-3">
                              <p className="font-semibold whitespace-nowrap">{b.guest_name || `User #${b.user_id}`}</p>
                              <p className="text-xs text-on-surface-variant">{b.guest_email}</p>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">#{b.room_id}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100"}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold">${Number(b.total_price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Pending approvals table */}
            {pendingAll.length > 0 && (
              <div className="bg-white rounded-xl border border-outline-variant/30">
                <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                  <h2 className="font-extrabold">All Pending Approvals</h2>
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{pendingAll.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low">
                      <tr>
                        {["#", "Guest", "Room", "Check-in", "Check-out", "Total", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {pendingAll.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-container-low/50">
                          <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">#{b.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold whitespace-nowrap">{b.guest_name || `User #${b.user_id}`}</p>
                            <p className="text-xs text-on-surface-variant">{b.guest_email}</p>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant">#{b.room_id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{b.check_in}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{b.check_out}</td>
                          <td className="px-4 py-3 font-bold">${Number(b.total_price).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleConfirm(b.id)}
                              disabled={actionLoading === b.id + "-confirm"}
                              className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {actionLoading === b.id + "-confirm" ? "Confirming…" : "Confirm"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
