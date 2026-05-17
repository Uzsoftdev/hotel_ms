import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { createUser } from "../../../services/admin";

const ROLES = [
  { value: "guest", label: "Guest", icon: "person", desc: "Standard hotel guest with booking access" },
  { value: "staff", label: "Staff", icon: "badge", desc: "Front-desk or operations staff member" },
  { value: "hotel_admin", label: "Hotel Admin", icon: "manage_accounts", desc: "Full admin access to hotel management" },
];

const DEPARTMENTS = ["Front Desk", "Housekeeping", "Maintenance", "Concierge", "Food & Beverage", "Security", "Management"];

const LOYALTY_TIERS = [
  { value: "bronze", label: "Bronze", points: 0 },
  { value: "silver", label: "Silver", points: 500 },
  { value: "gold", label: "Gold", points: 2000 },
  { value: "platinum", label: "Platinum", points: 5000 },
];

const EMPTY = {
  full_name: "", email: "", password: "", role: "guest", phone: "",
  department: "", notes: "", vip_status: false, loyalty_tier: "bronze", loyalty_points: 0,
};

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function set(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  const isStaff = ["staff", "hotel_admin"].includes(form.role);
  const isGuest = form.role === "guest";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      };
      if (isStaff) payload.department = form.department || undefined;
      if (isGuest) {
        payload.vip_status = form.vip_status;
        payload.loyalty_tier = form.loyalty_tier;
        payload.loyalty_points = Number(form.loyalty_points);
      }
      await createUser(payload);
      navigate(isGuest ? "/admin/guests" : "/admin/staff");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user");
    } finally { setSaving(false); }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Add User</h1>
          <p className="text-on-surface-variant mt-1">Create a guest, staff, or admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>{error}
            </div>
          )}

          {/* Role selection */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Role</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ value, label, icon, desc }) => (
                <button key={value} type="button" onClick={() => set("role", value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${form.role === value ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-outline-variant"}`}>
                  <span className={`material-symbols-outlined text-[28px] ${form.role === value ? "text-primary" : "text-on-surface-variant"}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <span className={`text-xs font-bold ${form.role === value ? "text-primary" : "text-on-surface"}`}>{label}</span>
                  <span className="text-[10px] text-on-surface-variant leading-tight">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Basic Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Full Name *</label>
                <input type="text" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Jane Smith" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="+1 555 000 0000" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Email Address *</label>
                <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="jane@example.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => set("password", e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary pr-10" placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-2 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {form.password && form.password.length < 8 && (
                  <p className="text-xs text-red-500 mt-1">At least 8 characters required</p>
                )}
              </div>
            </div>
          </div>

          {/* Staff-specific: department + notes */}
          {isStaff && (
            <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Staff Details</p>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Department</label>
                <select value={form.department} onChange={(e) => set("department", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Schedule notes, access restrictions, etc." />
              </div>
            </div>
          )}

          {/* Guest-specific: VIP + loyalty */}
          {isGuest && (
            <div className="bg-white rounded-xl border border-outline-variant/30 p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Loyalty & VIP</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => set("vip_status", !form.vip_status)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.vip_status ? "bg-amber-400" : "bg-outline-variant"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.vip_status ? "left-5" : "left-1"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">VIP Status</p>
                  <p className="text-xs text-on-surface-variant">Grants priority service and exclusive perks</p>
                </div>
              </label>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Loyalty Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {LOYALTY_TIERS.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => set("loyalty_tier", value)}
                      className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${form.loyalty_tier === value ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Starting Points</label>
                <input type="number" min={0} value={form.loyalty_points} onChange={(e) => set("loyalty_points", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Special requests, allergies, preferences…" />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
              {saving ? (
                <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Creating…</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]">person_add</span>Create User</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
