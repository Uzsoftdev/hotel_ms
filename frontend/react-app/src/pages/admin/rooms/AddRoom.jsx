import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { createRoom, getRoomTypes } from "../../../services/rooms";

const EMPTY = { room_number: "", room_type_id: "", floor: "", capacity: "", base_price: "", status: "available", description: "", is_active: true };

export default function AddRoom() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [roomTypes, setRoomTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getRoomTypes().then((r) => setRoomTypes(r.data)).catch(() => {});
  }, []);

  function set(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createRoom({
        ...form,
        floor: form.floor ? Number(form.floor) : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        base_price: Number(form.base_price),
        room_type_id: Number(form.room_type_id),
      });
      navigate("/admin/rooms");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create room");
    } finally { setSaving(false); }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Add Room</h1>
          <p className="text-on-surface-variant mt-1">Fill in the details to create a new room</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Room Number *</label>
              <input required value={form.room_number} onChange={(e) => set("room_number", e.target.value)}
                placeholder="e.g. 101"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Room Type *</label>
              <select required value={form.room_type_id} onChange={(e) => set("room_type_id", e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="">Select type…</option>
                {roomTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Floor</label>
              <input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Base Price ($) *</label>
              <input required type="number" step="0.01" min="0" value={form.base_price} onChange={(e) => set("base_price", e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                {["available", "occupied", "maintenance", "inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="is_active" className="text-sm font-semibold">Active (bookable by guests)</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate("/admin/rooms")} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Creating…" : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
