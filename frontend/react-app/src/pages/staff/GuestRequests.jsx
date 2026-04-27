import { useState } from "react";
import StaffLayout from "./Layout/StaffLayout";

const SAMPLE = [
  { id: 1, room: "201", guest: "Sarah Johnson", request: "Extra towels and pillow", priority: "normal", time: "10:30 AM", done: false },
  { id: 2, room: "315", guest: "Ahmed Hassan", request: "Room temperature too cold, please adjust AC", priority: "high", time: "11:15 AM", done: false },
  { id: 3, room: "102", guest: "Maria Garcia", request: "Late checkout until 2 PM", priority: "normal", time: "09:00 AM", done: true },
];

const PRIORITY_STYLE = { high: "bg-red-100 text-red-600", normal: "bg-gray-100 text-gray-600" };

export default function GuestRequests() {
  const [requests, setRequests] = useState(SAMPLE);

  function toggle(id) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, done: !r.done } : r));
  }

  const pending = requests.filter((r) => !r.done);
  const done = requests.filter((r) => r.done);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Guest Requests</h1>
          <p className="text-on-surface-variant mt-1">{pending.length} pending · {done.length} resolved today</p>
        </div>

        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Pending</h2>
            {pending.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-start gap-4">
                <button onClick={() => toggle(r.id)} className="w-5 h-5 mt-0.5 rounded border-2 border-outline-variant flex items-center justify-center shrink-0 hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-transparent">check</span>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-extrabold">Room #{r.room}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${PRIORITY_STYLE[r.priority]}`}>{r.priority}</span>
                    <span className="text-xs text-on-surface-variant ml-auto">{r.time}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5">{r.guest}</p>
                  <p className="text-sm mt-1">{r.request}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {done.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Resolved</h2>
            {done.map((r) => (
              <div key={r.id} className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-5 flex items-start gap-4 opacity-60">
                <button onClick={() => toggle(r.id)} className="w-5 h-5 mt-0.5 rounded bg-primary border-2 border-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-white">check</span>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold line-through">Room #{r.room}</p>
                    <span className="text-xs text-on-surface-variant ml-auto">{r.time}</span>
                  </div>
                  <p className="text-sm line-through text-on-surface-variant mt-0.5">{r.request}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white rounded-xl border border-outline-variant/30 py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">support_agent</span>
            <p className="font-semibold text-on-surface-variant">No guest requests right now</p>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
