import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getRoomTypes, createRoomType, updateRoomType, deleteRoomType } from "../../../services/rooms";

const EMPTY = { name: "", description: "", base_price: "", max_capacity: "", amenities: "" };

export default function RoomTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getRoomTypes().then((r) => setTypes(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function openNew() { setForm(EMPTY); setEditing(null); setShowForm(true); }
  function openEdit(t) {
    setForm({ ...t, amenities: Array.isArray(t.amenities) ? t.amenities.join(", ") : (t.amenities || "") });
    setEditing(t.id);
    setShowForm(true);
  }
  function cancel() { setShowForm(false); setEditing(null); setForm(EMPTY); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      base_price: Number(form.base_price),
      max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
      amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        const r = await updateRoomType(editing, payload);
        setTypes((prev) => prev.map((t) => t.id === editing ? r.data : t));
      } else {
        const r = await createRoomType(payload);
        setTypes((prev) => [...prev, r.data]);
      }
      cancel();
    } catch (err) { alert(err.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this room type? Rooms using it may be affected.")) return;
    try {
      await deleteRoomType(id);
      setTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Room Types</h1>
            <p className="text-on-surface-variant mt-1">Manage categories like Standard, Deluxe, Suite</p>
          </div>
          <button onClick={openNew} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>New Type
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-outline-variant/30 p-6">
            <h2 className="font-extrabold mb-4">{editing ? "Edit Room Type" : "New Room Type"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[["name", "Name", "text", true], ["base_price", "Base Price ($)", "number", true], ["max_capacity", "Max Capacity", "number", false]].map(([field, label, type, req]) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}</label>
                  <input type={type} required={req} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Amenities (comma-separated)</label>
                <input type="text" value={form.amenities} onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))}
                  placeholder="WiFi, AC, TV, Mini Bar"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={cancel} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Type"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {types.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-outline-variant/30 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold">{t.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{t.description || "No description"}</p>
                  </div>
                  <p className="text-lg font-extrabold text-primary shrink-0">${Number(t.base_price).toLocaleString()}</p>
                </div>
                {t.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(Array.isArray(t.amenities) ? t.amenities : String(t.amenities).split(",")).map((a) => (
                      <span key={a} className="text-[10px] font-semibold bg-surface-container px-2 py-0.5 rounded-full">{a.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/20">
                  <button onClick={() => openEdit(t)} className="text-primary text-xs font-semibold hover:underline">Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs font-semibold hover:underline">Delete</button>
                </div>
              </div>
            ))}
            {types.length === 0 && <div className="md:col-span-3 py-16 text-center text-on-surface-variant">No room types yet.</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
