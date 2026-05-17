import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getAllBookings } from "../../../services/admin";

const STATUS_COLOR = {
  pending: "bg-amber-400 text-white",
  confirmed: "bg-green-500 text-white",
  completed: "bg-blue-500 text-white",
  cancelled: "bg-red-400 text-white",
};
const STATUS_DOT = {
  pending: "bg-amber-400",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-400",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function bookingsForDay(bookings, dateStr) {
  return bookings.filter((b) => {
    if (!b.check_in || !b.check_out) return false;
    return b.check_in <= dateStr && b.check_out >= dateStr;
  });
}

export default function BookingCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    getAllBookings()
      .then((r) => {
        const data = r.data;
        setBookings(Array.isArray(data) ? data : (data?.items ?? data?.data ?? []));
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayOfMonth + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push(null);
    } else {
      cells.push(dayNum);
    }
  }

  const todayStr = today.toISOString().slice(0, 10);
  const selectedDateStr = selectedDay ? toDateStr(year, month, selectedDay) : null;
  const selectedBookings = selectedDateStr ? bookingsForDay(bookings, selectedDateStr) : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Booking Calendar</h1>
          <div className="flex items-center gap-2">
            {(["pending", "confirmed", "completed", "cancelled"]).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[s]}`} />
                <span className="text-xs text-on-surface-variant capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-outline-variant/30">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <h2 className="font-extrabold text-lg">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>

              <div className="p-4">
                {/* Day name headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-xs font-bold uppercase text-on-surface-variant py-1">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((dayNum, idx) => {
                    if (!dayNum) {
                      return <div key={`empty-${idx}`} className="h-16 sm:h-20" />;
                    }
                    const dateStr = toDateStr(year, month, dayNum);
                    const dayBookings = bookingsForDay(bookings, dateStr);
                    const isToday = dateStr === todayStr;
                    const isSelected = selectedDay === dayNum;

                    return (
                      <div
                        key={dayNum}
                        onClick={() => setSelectedDay(dayNum === selectedDay ? null : dayNum)}
                        className={`h-16 sm:h-20 rounded-lg p-1 cursor-pointer border transition-all overflow-hidden ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : isToday
                            ? "border-primary/40 bg-primary/5"
                            : "border-transparent hover:border-outline-variant/50 hover:bg-surface-container-low"
                        }`}
                      >
                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday ? "bg-primary text-white" : "text-on-surface"
                        }`}>
                          {dayNum}
                        </div>
                        <div className="mt-0.5 space-y-0.5">
                          {dayBookings.slice(0, 3).map((b) => (
                            <div
                              key={b.id}
                              className={`text-[9px] font-bold px-1 rounded truncate leading-tight py-0.5 ${STATUS_COLOR[b.status] || "bg-gray-200"}`}
                              title={`#${b.id} ${b.guest_name || ""} — ${b.status}`}
                            >
                              {b.guest_name ? b.guest_name.split(" ")[0] : `#${b.id}`}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-[9px] text-on-surface-variant font-semibold px-1">
                              +{dayBookings.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Side panel: selected day bookings */}
            <div className="bg-white rounded-xl border border-outline-variant/30 flex flex-col">
              <div className="px-6 py-4 border-b border-outline-variant/20">
                <h2 className="font-extrabold">
                  {selectedDay
                    ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}`
                    : "Select a day"}
                </h2>
                {selectedDay && (
                  <p className="text-xs text-on-surface-variant mt-0.5">{selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""}</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {!selectedDay ? (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_month</span>
                    <p className="text-sm">Click a day to see bookings</p>
                  </div>
                ) : selectedBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 0" }}>event_available</span>
                    <p className="text-sm">No bookings on this day</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {selectedBookings.map((b) => (
                      <div key={b.id} className="px-5 py-4 hover:bg-surface-container-low/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{b.guest_name || `User #${b.user_id}`}</p>
                            <p className="text-xs text-on-surface-variant truncate">{b.guest_email}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[b.status] || "bg-gray-200"}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Booking</p>
                            <p className="text-xs font-semibold">#{b.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Room</p>
                            <p className="text-xs font-semibold">#{b.room_id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Check-in</p>
                            <p className="text-xs font-semibold">{b.check_in}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Check-out</p>
                            <p className="text-xs font-semibold">{b.check_out}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Total</p>
                            <p className="text-xs font-bold text-primary">${Number(b.total_price).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
