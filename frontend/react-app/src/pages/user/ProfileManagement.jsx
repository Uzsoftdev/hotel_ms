import { useEffect, useRef, useState } from "react";
import UserLayout from "./Layout/UserLayout";
import { getProfile, updateProfile, changePassword, uploadProfilePhoto } from "../../services/user";
import { useAuth } from "../../contexts/AuthContext";

const SECTIONS = [
  { key: "profile",       icon: "person",        label: "Profile" },
  { key: "password",      icon: "lock",           label: "Password & security" },
  { key: "notifications", icon: "notifications",  label: "Notifications" },
];

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfileManagement() {
  const { refreshProfile } = useAuth();
  const [section, setSection] = useState("profile");
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", photo_url: "" });
  const [pwForm, setPwForm]   = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [notifs, setNotifs]   = useState({ confirmations: true, reminders: true, offers: false, marketing: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg]         = useState("");
  const [err, setErr]         = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    getProfile()
      .then((r) => setProfile({ full_name: r.data.full_name || "", email: r.data.email || "", phone: r.data.phone || "", photo_url: r.data.photo_url || "" }))
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { flash("Image must be under 5 MB.", true); return; }
    setUploadingPhoto(true);
    try {
      const r = await uploadProfilePhoto(file);
      setProfile((p) => ({ ...p, photo_url: r.data.photo_url || "" }));
      await refreshProfile();
      flash("Profile photo updated.");
    } catch (ex) {
      flash(ex.response?.data?.detail || "Failed to upload photo.", true);
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  function flash(message, isErr = false) {
    if (isErr) { setErr(message); setMsg(""); }
    else { setMsg(message); setErr(""); }
    setTimeout(() => { setMsg(""); setErr(""); }, 4000);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await updateProfile({ full_name: profile.full_name, email: profile.email, phone: profile.phone || null });
      setProfile({ full_name: r.data.full_name || "", email: r.data.email || "", phone: r.data.phone || "", photo_url: r.data.photo_url || "" });
      refreshProfile(); // update avatar in header immediately
      flash("Profile updated successfully.");
    } catch (ex) {
      flash(ex.response?.data?.detail || "Failed to update profile.", true);
    } finally {
      setSaving(false);
    }
  }

  async function savePw(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { flash("Passwords do not match.", true); return; }
    setChangingPw(true);
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
      flash("Password changed successfully.");
    } catch (ex) {
      flash(ex.response?.data?.detail || "Failed to change password.", true);
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <UserLayout>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-8">
        {/* ── Left nav ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => { setSection(key); flash(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                background: section === key ? "var(--primary-light)" : "transparent",
                color: section === key ? "var(--primary)" : "var(--text)",
                border: "none", textAlign: "left", transition: "all .15s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
              {label}
            </button>
          ))}
        </aside>

        {/* ── Main content ── */}
        <div>
          <h1 className="ah-h1" style={{ fontSize: 32, marginBottom: 24 }}>
            {SECTIONS.find((s) => s.key === section)?.label}
          </h1>

          {/* Flash messages */}
          {msg && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--success-bg)", borderRadius: 8, marginBottom: 20, color: "var(--success)", fontWeight: 600, fontSize: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>{msg}
            </div>
          )}
          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--error-bg)", borderRadius: 8, marginBottom: 20, color: "var(--error)", fontWeight: 600, fontSize: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>{err}
            </div>
          )}

          {/* ── Profile section ── */}
          {section === "profile" && (
            <>
              {/* Photo card */}
              <div className="ah-card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 className="ah-h3" style={{ marginBottom: 18 }}>Photo</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
                  <div
                    className="ah-avatar-upload"
                    onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                    style={{ cursor: uploadingPhoto ? "wait" : "pointer" }}
                  >
                    {loading ? "…" : profile.photo_url ? (
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${profile.photo_url}`} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    ) : getInitials(profile.full_name)}
                    <div className="ah-avatar-upload-overlay">
                      {uploadingPhoto
                        ? <span className="material-symbols-outlined" style={{ fontSize: 20, animation: "spin 1s linear infinite" }}>progress_activity</span>
                        : <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_camera</span><span>Upload</span></>
                      }
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Click to change</div>
                    <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>JPG, PNG or WebP · Max 5 MB</div>
                  </div>
                </div>
              </div>

              {/* Personal info */}
              <div className="ah-card" style={{ padding: 24 }}>
                <h3 className="ah-h3" style={{ marginBottom: 18 }}>Personal info</h3>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {Array(4).fill(0).map((_, i) => <div key={i} className="ah-skeleton" style={{ height: 44, borderRadius: 8 }} />)}
                  </div>
                ) : (
                  <form onSubmit={saveProfile}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Full name", key: "full_name", type: "text", col: "sm:col-span-2" },
                        { label: "Email",     key: "email",     type: "email", col: "sm:col-span-2" },
                        { label: "Phone",     key: "phone",     type: "tel",  col: "" },
                      ].map(({ label, key, type, col }) => (
                        <div key={key} className={`ah-field ${col}`}>
                          <label className="ah-label">{label}</label>
                          <input
                            className="ah-input"
                            type={type}
                            value={profile[key] || ""}
                            onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                            placeholder={label}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button type="button" className="ah-btn ah-btn-ghost ah-btn-sm" onClick={() => getProfile().then((r) => setProfile({ full_name: r.data.full_name || "", email: r.data.email || "", phone: r.data.phone || "" }))}>
                        Cancel
                      </button>
                      <button type="submit" className="ah-btn ah-btn-primary ah-btn-sm" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}

          {/* ── Password section ── */}
          {section === "password" && (
            <div className="ah-card" style={{ padding: 24 }}>
              <h3 className="ah-h3" style={{ marginBottom: 18 }}>Change password</h3>
              <form onSubmit={savePw}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Current password",  key: "current_password" },
                    { label: "New password",       key: "new_password" },
                    { label: "Confirm new password", key: "confirm_password" },
                  ].map(({ label, key }) => (
                    <div key={key} className="ah-field">
                      <label className="ah-label">{label}</label>
                      <input
                        className="ah-input"
                        type="password"
                        value={pwForm[key]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="ah-btn ah-btn-primary ah-btn-sm" disabled={changingPw}>
                    {changingPw ? "Changing…" : "Change password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Notifications section ── */}
          {section === "notifications" && (
            <div className="ah-card" style={{ padding: 24 }}>
              <h3 className="ah-h3" style={{ marginBottom: 18 }}>Notification preferences</h3>
              {[
                { key: "confirmations", label: "Booking confirmations & receipts", sub: "Email + SMS" },
                { key: "reminders",     label: "Check-in reminders",              sub: "Email only" },
                { key: "offers",        label: "Special offers & member rates",   sub: "Email only" },
                { key: "marketing",     label: "Marketing & newsletter",          sub: "Off" },
              ].map(({ key, label, sub }, i, arr) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                    <div className="ah-muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
                  </div>
                  <div
                    className={`ah-toggle ${notifs[key] ? "is-on" : ""}`}
                    onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                  />
                </div>
              ))}
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button className="ah-btn ah-btn-primary ah-btn-sm" onClick={() => flash("Preferences saved.")}>Save preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
