import { useEffect, useState } from "react";
import StaffLayout from "./Layout/StaffLayout";
import { getDailySummary, getAssignedBookings } from "../../services/staff";

export default function DailySummary() {
  const [summary, setSummary] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([getDailySummary(), getAssignedBookings("confirmed")])
      .then(([s, b]) => {
        setSummary(s.data);
        setTodayBookings(b.data.filter((bk) => bk.check_in === today || bk.check_out === today));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Daily Summary</h1>
          <p className="text-on-surface-variant mt-1">{today}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Rooms", value: summary?.total_rooms ?? "—", icon: "bed", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Bookings Today", value: summary?.total_bookings ?? "—", icon: "book_online", color: "text-green-600", bg: "bg-green-50" },
                { label: "Occupancy", value: summary ? `${summary.occupancy_rate_pct}%` : "—", icon: "percent", color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Check-ins/outs", value: todayBookings.length, icon: "swap_horiz", color: "text-primary", bg: "bg-primary/5" },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold">{value}</p>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-outline-variant/30">
              <div className="px-6 py-4 border-b border-outline-variant/20">
                <h2 className="font-extrabold">Today's Arrivals & Departures</h2>
              </div>
              {todayBookings.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant text-sm">No check-ins or check-outs today</div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  {todayBookings.map((b) => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const isCheckIn = b.check_in === todayStr;
                    return (
                      <div key={b.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="text-sm font-semibold">#{b.id} — {b.guest_name || `Guest #${b.user_id}`}</p>
                          <p className="text-xs text-on-surface-variant">Room #{b.room_id}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isCheckIn ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          <span className="material-symbols-outlined text-[14px]">{isCheckIn ? "login" : "logout"}</span>
                          {isCheckIn ? "Check-in" : "Check-out"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
