import { useState } from "react";
import StaffLayout from "./Layout/StaffLayout";

const INITIAL = [
  { id: 1, title: "Clean rooms 101–110", category: "housekeeping", priority: "high", done: false },
  { id: 2, title: "Restock minibar in suite 501", category: "housekeeping", priority: "normal", done: false },
  { id: 3, title: "Repair AC unit in room 302", category: "maintenance", priority: "high", done: false },
  { id: 4, title: "Prepare welcome package for VIP arrival", category: "concierge", priority: "normal", done: true },
];

const CATEGORY_STYLE = { housekeeping: "bg-green-100 text-green-700", maintenance: "bg-yellow-100 text-yellow-700", concierge: "bg-purple-100 text-purple-700", other: "bg-gray-100 text-gray-600" };
const PRIORITY_STYLE = { high: "bg-red-100 text-red-600", normal: "bg-gray-100 text-gray-500" };

let nextId = INITIAL.length + 1;

export default function TaskManagement() {
  const [tasks, setTasks] = useState(INITIAL);
  const [newTask, setNewTask] = useState({ title: "", category: "housekeeping", priority: "normal" });
  const [showForm, setShowForm] = useState(false);

  function toggle(id) { setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t)); }
  function remove(id) { setTasks((prev) => prev.filter((t) => t.id !== id)); }

  function addTask(e) {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setTasks((prev) => [...prev, { ...newTask, id: nextId++, done: false }]);
    setNewTask({ title: "", category: "housekeeping", priority: "normal" });
    setShowForm(false);
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Tasks</h1>
            <p className="text-on-surface-variant mt-1">{pending.length} pending · {done.length} completed</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>Add Task
          </button>
        </div>

        {showForm && (
          <form onSubmit={addTask} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Task *</label>
              <input required value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} placeholder="Describe the task…"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Category</label>
              <select value={newTask.category} onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))}
                className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                {["housekeeping", "maintenance", "concierge", "other"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                className="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Add</button>
            </div>
          </form>
        )}

        {pending.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Pending</h2>
            {pending.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-outline-variant/30 p-4 flex items-center gap-4">
                <button onClick={() => toggle(t.id)} className="w-5 h-5 rounded border-2 border-outline-variant flex items-center justify-center shrink-0 hover:border-primary transition-colors" />
                <p className="flex-1 text-sm font-semibold">{t.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_STYLE[t.category]}`}>{t.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                <button onClick={() => remove(t.id)} className="text-on-surface-variant hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {done.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Completed</h2>
            {done.map((t) => (
              <div key={t.id} className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center gap-4 opacity-60">
                <button onClick={() => toggle(t.id)} className="w-5 h-5 rounded bg-primary border-2 border-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-white">check</span>
                </button>
                <p className="flex-1 text-sm line-through text-on-surface-variant">{t.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_STYLE[t.category]}`}>{t.category}</span>
                <button onClick={() => remove(t.id)} className="text-on-surface-variant hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
