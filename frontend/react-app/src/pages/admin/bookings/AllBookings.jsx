import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getAllBookings, updateBookingStatus } from "../../../services/admin";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-blue-100 text-blue-700",
};
const TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return isNaN(diff) || diff < 0 ? "—" : diff;
}

export default function AllBookings({ lockedTab = null }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(lockedTab ?? "all");
  const [updating, setUpdating] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null); // { id, status }
  const [tabCounts, setTabCounts] = useState({});

  useEffect(() => {
    setLoading(true);
    // Fetch all bookings once to compute tab counts
    getAllBookings().then((r) => {
      const all = Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.data ?? []);
      const counts = { all: all.length };
      TABS.forEach((t) => {
        if (t !== "all") counts[t] = all.filter((b) => b.status === t).length;
      });
      setTabCounts(counts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setExpandedRow(null);
    getAllBookings(tab === "all" ? null : tab)
      .then((r) => {
        const data = r.data;
        setBookings(Array.isArray(data) ? data : (data?.items ?? data?.data ?? []));
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || b.guest_name?.toLowerCase().includes(q)
      || b.guest_email?.toLowerCase().includes(q);
    const matchFrom = !dateFrom || (b.check_in && b.check_in >= dateFrom);
    const matchTo = !dateTo || (b.check_in && b.check_in <= dateTo);
    return matchSearch && matchFrom && matchTo;
  });

  const summaryRevenue = filtered.reduce((acc, b) => acc + Number(b.total_price || 0), 0);
  const summaryConfirmed = filtered.filter((b) => b.status === "confirmed").length;
  const summaryPending = filtered.filter((b) => b.status === "pending").length;

  async function doStatusChange(id, status) {
    setUpdating(id);
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      // Update tab counts
      setTabCounts((prev) => {
        const oldStatus = bookings.find((b) => b.id === id)?.status;
        const updated = { ...prev };
        if (oldStatus && updated[oldStatus] > 0) updated[oldStatus] -= 1;
        updated[status] = (updated[status] || 0) + 1;
        return updated;
      });
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to update status");
    } finally {
      setUpdating(null);
      setConfirmCancel(null);
    }
  }

  function handleStatusChange(id, status) {
    if (status === "cancelled") {
      setConfirmCancel({ id, status });
    } else {
      doStatusChange(id, status);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {lockedTab === "pending" ? "Pending Approvals" : "All Bookings"}
          </h1>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>book_online</span>
            <div>
              <p className="text-lg font-extrabold">{filtered.length}</p>
              <p className="text-xs text-on-surface-variant">Total shown</p>
            </div>
          </div>
          <div className="bg-white border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            <div>
              <p className="text-lg font-extrabold">${summaryRevenue.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant">Total revenue</p>
            </div>
          </div>
          <div className="bg-white border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div>
              <p className="text-lg font-extrabold">{summaryConfirmed}</p>
              <p className="text-xs text-on-surface-variant">Confirmed</p>
            </div>
          </div>
          <div className="bg-white border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            <div>
              <p className="text-lg font-extrabold">{summaryPending}</p>
              <p className="text-xs text-on-surface-variant">Pending</p>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2.5 text-[16px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest name or email…"
              className="border border-outline-variant rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-60"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant whitespace-nowrap">Check-in from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant whitespace-nowrap">to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
            />
          </div>
          {(search || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
              className="text-xs text-on-surface-variant hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>Clear
            </button>
          )}
        </div>

        {/* Status tabs with counts */}
        {!lockedTab && (
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                  tab === t
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {t}
                {tabCounts[t] != null && (
                  <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t ? "bg-white/20 text-white" : "bg-surface-bright text-on-surface-variant"
                  }`}>
                    {tabCounts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["ID", "Guest", "Room", "Check-in", "Check-out", "Nights", "Total", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((b) => (
                  <>
                    <tr
                      key={b.id}
                      className="hover:bg-surface-container-low/50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === b.id ? null : b.id)}
                    >
                      <td className="px-4 py-3 font-semibold font-mono text-xs text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <span className={`material-symbols-outlined text-[14px] text-on-surface-variant transition-transform ${expandedRow === b.id ? "rotate-90" : ""}`}>chevron_right</span>
                          #{b.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold whitespace-nowrap">{b.guest_name || "—"}</div>
                        <div className="text-xs text-on-surface-variant">{b.guest_email}</div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">#{b.room_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{b.check_in}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{b.check_out}</td>
                      <td className="px-4 py-3 font-bold">{nightsBetween(b.check_in, b.check_out)}</td>
                      <td className="px-4 py-3 font-bold">${Number(b.total_price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          disabled={updating === b.id}
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="text-xs border border-outline-variant rounded px-2 py-1 bg-white focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                          {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Inline confirm cancel */}
                    {confirmCancel?.id === b.id && (
                      <tr key={`cancel-confirm-${b.id}`} className="bg-red-50">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                            <p className="text-sm font-semibold text-red-700">
                              Are you sure you want to cancel booking #{b.id} for {b.guest_name || "this guest"}?
                            </p>
                            <button
                              onClick={() => doStatusChange(confirmCancel.id, confirmCancel.status)}
                              disabled={updating === b.id}
                              className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {updating === b.id ? "Cancelling…" : "Yes, Cancel"}
                            </button>
                            <button
                              onClick={() => setConfirmCancel(null)}
                              className="px-4 py-1.5 bg-surface-container text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-low transition-colors"
                            >
                              No, Keep
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expanded detail row */}
                    {expandedRow === b.id && confirmCancel?.id !== b.id && (
                      <tr key={`detail-${b.id}`} className="bg-surface-container-low/50">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Booking ID</p>
                              <p className="font-semibold">#{b.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Guest Name</p>
                              <p className="font-semibold">{b.guest_name || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Email</p>
                              <p className="font-semibold break-all">{b.guest_email || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Room</p>
                              <p className="font-semibold">#{b.room_id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Check-in</p>
                              <p className="font-semibold">{b.check_in}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Check-out</p>
                              <p className="font-semibold">{b.check_out}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Total Price</p>
                              <p className="font-semibold">${Number(b.total_price).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Guests Count</p>
                              <p className="font-semibold">{b.guests_count ?? b.num_guests ?? "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Status</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100"}`}>{b.status}</span>
                            </div>
                            <div>
                              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Created At</p>
                              <p className="font-semibold">{b.created_at ? new Date(b.created_at).toLocaleString() : "—"}</p>
                            </div>
                            {b.special_requests && (
                              <div className="col-span-2 sm:col-span-3 md:col-span-4">
                                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Special Requests</p>
                                <p className="font-semibold italic text-on-surface-variant">{b.special_requests}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-on-surface-variant">
                      {search || dateFrom || dateTo ? "No bookings match your filters" : "No bookings found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
