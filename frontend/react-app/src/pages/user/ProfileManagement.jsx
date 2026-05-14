import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "./Layout/UserLayout";
import { getProfile, updateProfile, changePassword, uploadProfilePhoto, deleteProfilePhoto, getPaymentHistory, getMyReviews } from "../../services/user";
import { useAuth } from "../../contexts/AuthContext";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function completionScore(profile) {
  let score = 25; // email always present
  if (profile.full_name?.trim()) score += 30;
  if (profile.phone?.trim())     score += 25;
  if (profile.photo_url?.trim()) score += 20;
  return Math.min(score, 100);
}

/* ── sub-components ──────────────────────────────────────────────────────── */
function Row({ icon, label, value, hint, action }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr auto", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-secondary)" }}>{icon}</span>}
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: value ? "var(--text)" : "var(--text-tertiary)" }}>
          {value || "Not set"}
        </div>
        {hint && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{hint}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function SectionCard({ eyebrow, title, action, children, noPad }) {
  return (
    <section style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          {eyebrow && (
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 3 }}>
              {eyebrow}
            </div>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>{title}</h2>
        </div>
        {action}
      </div>
      <div className="ah-card" style={{ padding: noPad ? 0 : 24 }}>{children}</div>
    </section>
  );
}

function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`ah-toggle ${on ? "is-on" : ""}`}
      style={{ cursor: "pointer" }}
    />
  );
}

/* ── section nav ─────────────────────────────────────────────────────────── */
const SECTIONS = [
  { key: "profile",         icon: "person",        label: "Profile" },
  { key: "security",        icon: "lock",          label: "Password & security" },
  { key: "notifications",   icon: "notifications", label: "Notifications" },
  { key: "payments",        icon: "credit_card",   label: "Payment methods" },
  { key: "payment_history", icon: "history",       label: "Payment history" },
  { key: "my_reviews",      icon: "star",          label: "My reviews" },
];

/* ── main component ──────────────────────────────────────────────────────── */
export default function ProfileManagement() {
  const { refreshProfile, user: authUser } = useAuth();
  const [section, setSection] = useState("profile");
  const [editing, setEditing]   = useState(false);

  // Seed from AuthContext so Google/social users see their data immediately
  const [profile, setProfile] = useState({
    full_name: authUser?.full_name || "",
    email:     authUser?.email     || "",
    phone:     authUser?.phone     || "",
    photo_url: authUser?.photo_url || "",
  });
  const [editForm, setEditForm] = useState({
    full_name: authUser?.full_name || "",
    email:     authUser?.email     || "",
    phone:     authUser?.phone     || "",
  });
  const [pwForm, setPwForm]     = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [notifs, setNotifs]     = useState({ confirmations: true, reminders: true, offers: false, marketing: false });

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [payHistory, setPayHistory]     = useState([]);
  const [payHistLoading, setPayHistLoading] = useState(false);
  const [myReviews, setMyReviews]       = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getProfile()
      .then((r) => {
        const d = r.data;
        const p = { full_name: d.full_name || "", email: d.email || "", phone: d.phone || "", photo_url: d.photo_url || "" };
        setProfile(p);
        setEditForm({ full_name: p.full_name, email: p.email, phone: p.phone });
      })
      .catch(() => {
        // Keep the AuthContext-seeded state if the API call fails
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (section === "payment_history" && payHistory.length === 0 && !payHistLoading) {
      setPayHistLoading(true);
      getPaymentHistory()
        .then((r) => setPayHistory(Array.isArray(r.data) ? r.data : r.data?.items || []))
        .catch(() => {})
        .finally(() => setPayHistLoading(false));
    }
    if (section === "my_reviews" && myReviews.length === 0 && !reviewsLoading) {
      setReviewsLoading(true);
      getMyReviews()
        .then((r) => setMyReviews(Array.isArray(r.data) ? r.data : r.data?.items || []))
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [section]); // eslint-disable-line

  function flash(message, isErr = false) {
    if (isErr) { setErr(message); setMsg(""); }
    else        { setMsg(message); setErr(""); }
    setTimeout(() => { setMsg(""); setErr(""); }, 4000);
  }

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

  async function handleRemovePhoto() {
    setUploadingPhoto(true);
    try {
      await deleteProfilePhoto();
      setProfile((p) => ({ ...p, photo_url: "" }));
      await refreshProfile();
      flash("Photo removed.");
    } catch (ex) {
      flash(ex.response?.data?.detail || "Failed to remove photo.", true);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await updateProfile({ full_name: editForm.full_name, email: editForm.email, phone: editForm.phone || null });
      const updated = { full_name: r.data.full_name || "", email: r.data.email || "", phone: r.data.phone || "", photo_url: r.data.photo_url || "" };
      setProfile(updated);
      setEditForm({ full_name: updated.full_name, email: updated.email, phone: updated.phone });
      refreshProfile();
      setEditing(false);
      flash("Profile updated.");
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

  const score = completionScore(profile);
  const photoSrc = profile.photo_url
    ? (profile.photo_url.startsWith("http") ? profile.photo_url : `${import.meta.env.VITE_API_URL || ""}${profile.photo_url}`)
    : null;

  const isSectionDone = (key) => {
    if (key === "profile")       return !!(profile.full_name && profile.phone);
    if (key === "security")      return true;
    if (key === "notifications") return true;
    return false;
  };

  return (
    <UserLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Breadcrumb ────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 20 }}>
          <span>Account</span>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span style={{ color: "var(--text)" }}>Profile & settings</span>
        </div>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <div className="ah-card" style={{ padding: 28, marginBottom: 28, position: "relative", overflow: "hidden" }}>
          {/* decorative blob */}
          <div style={{ position: "absolute", top: -100, right: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07), transparent 70%)", pointerEvents: "none" }} />

          {/* Avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
            <div style={{ position: "relative" }}>
              <div
                className="ah-avatar-upload"
                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                style={{ width: 88, height: 88, fontSize: 28, cursor: uploadingPhoto ? "wait" : "pointer" }}
              >
                {loading ? "…" : photoSrc ? (
                  <img src={photoSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : getInitials(profile.full_name)}
                <div className="ah-avatar-upload-overlay" style={{ borderRadius: "50%" }}>
                  {uploadingPhoto
                    ? <span className="material-symbols-outlined" style={{ fontSize: 20, animation: "spin 1s linear infinite" }}>progress_activity</span>
                    : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span><span style={{ fontSize: 11 }}>Change</span></>
                  }
                </div>
              </div>
              {/* Verified dot */}
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: "50%", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: "white", fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>
                  {loading ? "Loading…" : profile.full_name || "Your Name"}
                </h1>
                <span style={{ background: "linear-gradient(135deg,#FCD34D,#F59E0B)", color: "#78350F", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  Member
                </span>
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>
                {profile.email || "—"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {photoSrc && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--error)", background: "var(--error-bg)", border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: 6 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                    Remove photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setSection("profile"); setEditing(true); }}
                  className="ah-btn ah-btn-secondary ah-btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  Edit profile
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Flash messages ────────────────────────────────────────── */}
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

        {/* ── Two-column body ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 28, alignItems: "flex-start" }}>

          {/* Sticky sidebar */}
          <aside style={{ position: "sticky", top: 24 }}>
            {/* Nav */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {SECTIONS.map((it) => (
                <button
                  key={it.key}
                  onClick={() => { setSection(it.key); setEditing(false); flash(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, border: "none", textAlign: "left",
                    background: section === it.key ? "var(--primary-light)" : "transparent",
                    color: section === it.key ? "var(--primary)" : "var(--text)",
                    transition: "all .15s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{it.icon}</span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {isSectionDone(it.key) && (
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--success)", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}

            </nav>

            {/* Help box */}
            <div style={{ marginTop: 16, padding: 14, background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)", borderRadius: 10, fontSize: 12, fontWeight: 500 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary-dark)", marginBottom: 4 }}>Need help?</div>
              <div style={{ color: "var(--text)", marginBottom: 10, lineHeight: 1.5 }}>Contact support if you need to update account details.</div>
              <Link to="/contact" style={{ display: "block", textAlign: "center", background: "var(--primary)", color: "white", padding: "7px 0", borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                Contact support
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* ════ PROFILE ════ */}
            {section === "profile" && (
              <>
                {/* Photo */}
                <SectionCard eyebrow="01" title="Photo">
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div
                      className="ah-avatar-upload"
                      onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                      style={{ width: 80, height: 80, fontSize: 24, cursor: uploadingPhoto ? "wait" : "pointer", flexShrink: 0 }}
                    >
                      {loading ? "…" : photoSrc ? (
                        <img src={photoSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : getInitials(profile.full_name)}
                      <div className="ah-avatar-upload-overlay" style={{ borderRadius: "50%" }}>
                        {uploadingPhoto
                          ? <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>progress_activity</span>
                          : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span><span style={{ fontSize: 11 }}>Change</span></>
                        }
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Hover to change</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>JPG or PNG · Max 5MB</div>
                      {photoSrc && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--error)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>
                </SectionCard>

                {/* Personal info */}
                <SectionCard
                  eyebrow="02"
                  title="Personal information"
                  action={
                    !editing && (
                      <button onClick={() => setEditing(true)} className="ah-btn ah-btn-secondary ah-btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                        Edit
                      </button>
                    )
                  }
                  noPad
                >
                  {!editing ? (
                    <div style={{ padding: "8px 24px" }}>
                      <Row icon="badge"  label="Full name" value={profile.full_name} hint="Used across your account" />
                      <Row icon="mail"   label="Email"     value={profile.email}
                        action={<span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 9999, background: "var(--success-bg)", color: "var(--success)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>verified</span>Verified
                        </span>}
                      />
                      <Row icon="call"   label="Phone"     value={profile.phone} hint="Optional · used for check-in notifications" />
                    </div>
                  ) : (
                    <form onSubmit={saveProfile} style={{ padding: "16px 24px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div className="ah-field" style={{ gridColumn: "1 / -1" }}>
                          <label className="ah-label">Full name</label>
                          <input className="ah-input" type="text" value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            placeholder="Your full name" />
                        </div>
                        <div className="ah-field" style={{ gridColumn: "1 / -1" }}>
                          <label className="ah-label">Email</label>
                          <input className="ah-input" type="email" value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            placeholder="Email address" />
                        </div>
                        <div className="ah-field">
                          <label className="ah-label">Phone</label>
                          <input className="ah-input" type="tel" value={editForm.phone || ""}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000" />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                        <button type="button" className="ah-btn ah-btn-ghost ah-btn-sm"
                          onClick={() => { setEditing(false); setEditForm({ full_name: profile.full_name, email: profile.email, phone: profile.phone }); }}>
                          Cancel
                        </button>
                        <button type="submit" className="ah-btn ah-btn-primary ah-btn-sm" disabled={saving}>
                          {saving ? "Saving…" : "Save changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </SectionCard>
              </>
            )}

            {/* ════ SECURITY ════ */}
            {section === "security" && (
              <>
                {/* Status cards */}
                <SectionCard eyebrow="01" title="Security overview">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { icon: "password",      label: "Password",     value: "Protected",              tone: "success" },
                      { icon: "mail",          label: "Email",        value: "Verified",               tone: "success" },
                      { icon: "phone_iphone",  label: "2-step auth",  value: profile.phone ? "Active" : "Not set", tone: profile.phone ? "success" : "warning" },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: s.tone === "success" ? "var(--success-bg)" : "var(--warning-bg)", color: s.tone === "success" ? "var(--success)" : "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{s.icon}</span>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</span>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: s.tone === "success" ? "var(--success)" : "var(--warning)", marginLeft: "auto", fontVariationSettings: "'FILL' 1" }}>
                            {s.tone === "success" ? "check_circle" : "warning"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Change password */}
                <SectionCard eyebrow="02" title="Change password">
                  <form onSubmit={savePw} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      { label: "Current password",     key: "current_password",  k: "current" },
                      { label: "New password",          key: "new_password",      k: "new" },
                      { label: "Confirm new password",  key: "confirm_password",  k: "confirm" },
                    ].map(({ label, key, k }) => (
                      <div key={key} className="ah-field">
                        <label className="ah-label">{label}</label>
                        <div style={{ position: "relative" }}>
                          <input
                            className="ah-input"
                            type={showPw[k] ? "text" : "password"}
                            value={pwForm[key]}
                            onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                            placeholder="••••••••"
                            style={{ paddingRight: 40 }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, [k]: !p[k] }))}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 0 }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPw[k] ? "visibility_off" : "visibility"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button type="submit" className="ah-btn ah-btn-primary ah-btn-sm" disabled={changingPw}>
                        {changingPw ? "Changing…" : "Change password"}
                      </button>
                    </div>
                  </form>
                </SectionCard>
              </>
            )}

            {/* ════ NOTIFICATIONS ════ */}
            {section === "notifications" && (
              <SectionCard eyebrow="01" title="Notification preferences">
                {[
                  { key: "confirmations", label: "Booking confirmations & receipts", sub: "Sent by email and SMS after every booking" },
                  { key: "reminders",     label: "Check-in reminders",              sub: "48h and 4h before your arrival" },
                  { key: "offers",        label: "Special offers & member rates",   sub: "Exclusive rates and point bonuses via email" },
                  { key: "marketing",     label: "Marketing & newsletter",          sub: "Hotel news, travel inspiration and updates" },
                ].map(({ key, label, sub }, i, arr) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{sub}</div>
                    </div>
                    <Toggle on={notifs[key]} onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))} />
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <button className="ah-btn ah-btn-primary ah-btn-sm" onClick={() => flash("Preferences saved.")}>
                    Save preferences
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ════ PAYMENTS (placeholder) ════ */}
            {section === "payments" && (
              <SectionCard eyebrow="01" title="Payment methods">
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--border-strong)", display: "block", marginBottom: 12 }}>credit_card_off</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>No payment methods saved</p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>Payment methods are managed during checkout.</p>
                </div>
              </SectionCard>
            )}

            {/* ════ PAYMENT HISTORY ════ */}
            {section === "payment_history" && (
              <SectionCard eyebrow="01" title="Payment history">
                {payHistLoading ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--primary)", animation: "spin 1s linear infinite", display: "block", marginBottom: 8 }}>progress_activity</span>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Loading payments…</p>
                  </div>
                ) : payHistory.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--border-strong)", display: "block", marginBottom: 12 }}>receipt_long</span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>No payments yet</p>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>Your booking payments will appear here.</p>
                  </div>
                ) : (
                  <div>
                    {payHistory.map((p, i) => (
                      <div key={p.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < payHistory.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--success)" }}>check_circle</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.description || p.booking_id ? `Booking #${p.booking_id}` : "Payment"}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                              {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>${Number(p.amount || 0).toLocaleString()}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: p.status === "paid" ? "var(--success)" : "var(--text-secondary)", marginTop: 2 }}>{p.status || "paid"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ════ MY REVIEWS ════ */}
            {section === "my_reviews" && (
              <SectionCard eyebrow="01" title="My reviews">
                {reviewsLoading ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--primary)", animation: "spin 1s linear infinite", display: "block", marginBottom: 8 }}>progress_activity</span>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Loading reviews…</p>
                  </div>
                ) : myReviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--border-strong)", display: "block", marginBottom: 12 }}>rate_review</span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>No reviews yet</p>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>After your stay, you can leave a review for the hotel.</p>
                  </div>
                ) : (
                  <div>
                    {myReviews.map((rv, i) => (
                      <div key={rv.id || i} style={{ padding: "16px 0", borderBottom: i < myReviews.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{rv.hotel_name || rv.room_name || `Review #${rv.id}`}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                              {rv.created_at ? new Date(rv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[...Array(5)].map((_, s) => (
                              <span key={s} className="material-symbols-outlined" style={{ fontSize: 14, color: s < (rv.rating || 0) ? "#F59E0B" : "var(--border-strong)", fontVariationSettings: s < (rv.rating || 0) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </div>
                        {rv.comment && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{rv.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

          </div>
        </div>
      </div>
    </UserLayout>
  );
}
