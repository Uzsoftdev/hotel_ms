import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getBlackoutDates, createBlackoutDate, deleteBlackoutDate } from "../../../services/admin";
import DateRangePicker from "../../common/DateRangePicker";

export default function BlackoutDates() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_date: "", end_date: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getBlackoutDates().then((r) => setDates(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await createBlackoutDate(form);
      setDates((prev) => [...prev, r.data]);
      setForm({ start_date: "", end_date: "", reason: "" });
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this blackout period?")) return;
    setDeleting(id);
    try {
      await deleteBlackoutDate(id);
      setDates((prev) => prev.filter((d) => d.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setDeleting(null); }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Blackout Dates</h1>
            <p className="text-on-surface-variant mt-1">Block date ranges from being booked (maintenance, private events)</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">event_busy</span>Add Blackout
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
            <h2 className="font-extrabold mb-4">New Blackout Period</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <DateRangePicker
                  checkIn={form.start_date}
                  checkOut={form.end_date}
                  onChange={({ checkIn, checkOut }) => setForm((p) => ({ ...p, start_date: checkIn, end_date: checkOut }))}
                  label="Start Date — End Date *"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Reason</label>
                <input value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder="e.g. Annual maintenance"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="md:col-span-3 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                  {saving ? "Saving…" : "Add Blackout"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : dates.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant/30 py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">event_available</span>
            <p className="font-semibold text-on-surface-variant">No blackout dates set — all dates are open for booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dates.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-outline-variant/30 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-red-500">event_busy</span>
                  <div>
                    <p className="font-extrabold">{d.start_date} → {d.end_date}</p>
                    {d.reason && <p className="text-sm text-on-surface-variant mt-0.5">{d.reason}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id} className="text-red-500 hover:underline text-sm font-semibold disabled:opacity-50">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
