import { useEffect, useState } from "react";
import AdminLayout from "./Layout/AdminLayout";
import { getProfile, updateProfile, changePassword } from "../../services/user";
import { useAuth } from "../../contexts/AuthContext";
import PhoneInput from "../../components/PhoneInput";

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", email: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [msg, setMsg] = useState({ profile: "", pw: "" });
  const [err, setErr] = useState({ profile: "", pw: "" });

  useEffect(() => {
    getProfile()
      .then((r) => setProfile({ full_name: r.data.full_name || "", email: r.data.email, phone: r.data.phone || "" }))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true); setErr({ ...err, profile: "" }); setMsg({ ...msg, profile: "" });
    try {
      const r = await updateProfile({ full_name: profile.full_name, email: profile.email, phone: profile.phone || null });
      setProfile({ full_name: r.data.full_name || "", email: r.data.email, phone: r.data.phone || "" });
      setMsg({ ...msg, profile: "Profile updated successfully." });
    } catch (ex) {
      setErr({ ...err, profile: ex.response?.data?.detail || "Failed to update." });
    } finally { setSaving(false); }
  }

  async function savePw(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      setErr({ ...err, pw: "New passwords do not match." }); return;
    }
    setChangingPw(true); setErr({ ...err, pw: "" }); setMsg({ ...msg, pw: "" });
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
      setMsg({ ...msg, pw: "Password changed successfully." });
    } catch (ex) {
      setErr({ ...err, pw: ex.response?.data?.detail || "Failed to change password." });
    } finally { setChangingPw(false); }
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    </AdminLayout>
  );

  const initials = profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">My Profile</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage your admin account details</p>
        </div>

        {/* Avatar card */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-bright p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-2xl font-extrabold text-primary">{initials || "A"}</span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-on-surface">{profile.full_name || "Admin"}</p>
            <p className="text-sm text-on-surface-variant">{profile.email}</p>
            <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
              {user?.role?.replace("_", " ") || "Admin"}
            </span>
          </div>
        </div>

        {/* Personal info */}
        <section className="rounded-xl border border-outline-variant/30 bg-surface-bright p-6 space-y-5">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface-variant">Personal Information</h2>
          {msg.profile && <p className="text-green-600 text-sm font-semibold">{msg.profile}</p>}
          {err.profile && <p className="text-red-600 text-sm font-semibold">{err.profile}</p>}
          <form onSubmit={saveProfile} className="space-y-4">
            {[
              { label: "Full Name", key: "full_name", type: "text", placeholder: "Admin User" },
              { label: "Email Address", key: "email", type: "email", placeholder: "admin@allstay.com" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
                <input
                  type={type} placeholder={placeholder} value={profile[key] || ""}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Phone Number</label>
              <PhoneInput
                value={profile.phone || ""}
                onChange={(v) => setProfile({ ...profile, phone: v })}
              />
            </div>
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="rounded-xl border border-outline-variant/30 bg-surface-bright p-6 space-y-5">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface-variant">Change Password</h2>
          {msg.pw && <p className="text-green-600 text-sm font-semibold">{msg.pw}</p>}
          {err.pw && <p className="text-red-600 text-sm font-semibold">{err.pw}</p>}
          <form onSubmit={savePw} className="space-y-4">
            {[
              { label: "Current Password", key: "current_password" },
              { label: "New Password", key: "new_password" },
              { label: "Confirm New Password", key: "confirm_password" },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
                <input type="password" value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
            <button type="submit" disabled={changingPw}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
              {changingPw ? "Changing…" : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
