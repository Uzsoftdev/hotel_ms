import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getPricingRules, createPricingRule, deletePricingRule } from "../../../services/admin";
import DateRangePicker from "../../../components/common/DateRangePicker";

const EMPTY = { name: "", multiplier: "", start_date: "", end_date: "", day_of_week: "", room_type_id: "", priority: "1" };

export default function DynamicPricing() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getPricingRules().then((r) => setRules(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function set(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      multiplier: Number(form.multiplier),
      priority: Number(form.priority),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      day_of_week: form.day_of_week ? Number(form.day_of_week) : null,
      room_type_id: form.room_type_id ? Number(form.room_type_id) : null,
    };
    try {
      const r = await createPricingRule(payload);
      setRules((prev) => [...prev, r.data]);
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this pricing rule?")) return;
    setDeleting(id);
    try {
      await deletePricingRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setDeleting(null); }
  }

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dynamic Pricing</h1>
            <p className="text-on-surface-variant mt-1">Create multiplier rules for seasons, weekends, and events</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>New Rule
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
            <h2 className="font-extrabold mb-4">New Pricing Rule</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Rule Name *</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Weekend Premium"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Price Multiplier * (e.g. 1.5 = +50%)</label>
                <input required type="number" step="0.01" min="0.1" value={form.multiplier} onChange={(e) => set("multiplier", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="col-span-2">
                <DateRangePicker
                  checkIn={form.start_date}
                  checkOut={form.end_date}
                  onChange={({ checkIn, checkOut }) => { set("start_date", checkIn); set("end_date", checkOut); }}
                  label="Start Date — End Date"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Day of Week (optional)</label>
                <select value={form.day_of_week} onChange={(e) => set("day_of_week", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">Any day</option>
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Priority (higher = applied first)</label>
                <input type="number" min="1" value={form.priority} onChange={(e) => set("priority", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                  {saving ? "Saving…" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : rules.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant/30 py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">sell</span>
            <p className="font-semibold text-on-surface-variant">No pricing rules yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>{["Name", "Multiplier", "Date Range", "Day", "Priority", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 font-semibold">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.multiplier > 1 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                        ×{r.multiplier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.start_date && r.end_date ? `${r.start_date} → ${r.end_date}` : "Always"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.day_of_week != null ? DAYS[r.day_of_week] : "Any"}</td>
                    <td className="px-4 py-3">{r.priority}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="text-red-500 hover:underline text-xs font-semibold disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
