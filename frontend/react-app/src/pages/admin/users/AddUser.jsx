import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { createUser } from "../../../services/admin";

const EMPTY = { full_name: "", email: "", password: "", role: "guest", phone: "" };

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createUser(form);
      navigate(form.role === "guest" ? "/admin/guests" : "/admin/staff");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user");
    } finally { setSaving(false); }
  }

  return (
    <AdminLayout>
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Add User</h1>
          <p className="text-on-surface-variant mt-1">Create a guest, staff, or admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline-variant/30 p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-lg">{error}</div>}

          {[["full_name", "Full Name", "text", true], ["email", "Email Address", "email", true], ["password", "Password", "password", true], ["phone", "Phone Number", "tel", false]].map(([field, label, type, req]) => (
            <div key={field}>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">{label}{req && " *"}</label>
              <input type={type} required={req} value={form[field]} onChange={(e) => set(field, e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Role *</label>
            <select required value={form.role} onChange={(e) => set("role", e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
              <option value="guest">Guest</option>
              <option value="staff">Staff</option>
              <option value="hotel_admin">Hotel Admin</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
