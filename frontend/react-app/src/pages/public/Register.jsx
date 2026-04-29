import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";
import registerBack from "../../assets/images/hotel3.png";

function EyeButton({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      style={{
        position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer",
        color: show ? "var(--primary)" : "var(--text-tertiary)",
        transition: "color .2s, transform .2s",
        display: "flex", alignItems: "center", padding: 2,
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1.15)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 19, transition: "opacity .2s", opacity: show ? 1 : 0.6 }}>
        {show ? "visibility" : "visibility_off"}
      </span>
    </button>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["var(--border-strong)", "var(--error)", "var(--warning)", "#ca8a04", "var(--success)"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score] : "var(--border)", transition: "background .2s" }} />
        ))}
      </div>
      <span className="ah-help" style={{ color: colors[score] }}>
        <strong>{labels[score]}</strong>
        {score < 4 ? ` · Need: ${[!checks[0]&&"8+ chars", !checks[1]&&"uppercase", !checks[2]&&"number", !checks[3]&&"symbol (!@#$%)"].filter(Boolean).join(", ")}` : " · Great password!"}
      </span>
    </div>
  );
}

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function parseBackendError(err, fallback) {
    const data = err.response?.data;
    if (!data) return fallback;
    // Standard FastAPI HTTPException format: { detail: "..." | [...] }
    if (data.detail) {
      return Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
    }
    // Custom handler format: { error: "...", details: [{field, message}] }
    if (data.details?.length) {
      return data.details[0].message.replace(/^Value error,\s*/i, "");
    }
    if (data.error) return data.error;
    return fallback;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(form.password)) {
      setError("Password must include at least one special character (e.g. !@#$%).");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
      });

      const loginRes = await login({ username: form.email, password: form.password });
      await loginUser(loginRes.data.access_token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(parseBackendError(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Left: ocean brand panel (hidden on mobile) ── */}
      <aside style={{ flex: "0 0 45%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56 }}
        className="hidden lg:flex">
        <img src={registerBack} alt="allStay Hotel" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,.45) 0%, rgba(15,23,42,.75) 100%)", zIndex: 1 }} />

        {/* Logo */}
        <Link to="/" style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}><span style={{ color: "#fff" }}>all</span><span style={{ color: "#93c5fd" }}>Stay</span></span>
        </Link>

        {/* Quote */}
        <div style={{ position: "relative", zIndex: 2, color: "#fff" }}>
          <div style={{ fontSize: 64, lineHeight: 1, opacity: 0.45, marginBottom: 12, fontFamily: "Georgia,serif" }}>"</div>
          <p style={{ fontSize: 21, lineHeight: 1.45, fontWeight: 700, letterSpacing: "-0.015em", maxWidth: 380 }}>
            The kind of place where time bends. We extended twice and still left too soon.
          </p>
          <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.65)" }}>
            Sofía R. · Atlantic Sunrise Suite, 5 nights
          </div>
        </div>

        {/* Perks */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "star",          text: "Exclusive member-only rates" },
            { icon: "priority_high", text: "Priority room selection" },
            { icon: "card_giftcard", text: "Loyalty rewards program" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 16 }}>{icon}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>{text}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right: form ── */}
      <div className="flex flex-col justify-center overflow-y-auto bg-white px-5 py-10 sm:px-10 sm:py-12" style={{ flex: 1 }}>
        <div style={{ maxWidth: 460, width: "100%", margin: "0 auto" }}>
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 32 }}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}><span style={{ color: "#0f172a" }}>all</span><span style={{ color: "#2563EB" }}>Stay</span></span>
          </Link>

          <h1 className="ah-h1" style={{ fontSize: 30, marginBottom: 6 }}>Create your account</h1>
          <p className="ah-muted" style={{ fontSize: 14, marginBottom: 28 }}>
            Get member rates and room upgrades.{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in instead</Link>
          </p>

          {/* Error banner */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "var(--error-bg)", borderRadius: 8, marginBottom: 20, color: "var(--error)", fontSize: 13, fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, flexShrink: 0 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* First name */}
              <div className="ah-field">
                <label className="ah-label">First name</label>
                <input className="ah-input" type="text" placeholder="Elena" value={form.firstName} onChange={set("firstName")} required />
              </div>

              {/* Last name */}
              <div className="ah-field">
                <label className="ah-label">Last name</label>
                <input className="ah-input" type="text" placeholder="Marin" value={form.lastName} onChange={set("lastName")} required />
              </div>

              {/* Email */}
              <div className="ah-field col-span-1 sm:col-span-2">
                <label className="ah-label">Email address</label>
                <input className="ah-input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
              </div>

              {/* Password */}
              <div className="ah-field col-span-1 sm:col-span-2">
                <label className="ah-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input className="ah-input" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={set("password")} required style={{ paddingRight: 44 }} />
                  <EyeButton show={showPw} onToggle={() => setShowPw((s) => !s)} />
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm password */}
              <div className="ah-field col-span-1 sm:col-span-2">
                <label className="ah-label">Confirm password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`ah-input ${form.confirmPassword && form.password !== form.confirmPassword ? "is-error" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <EyeButton show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <span className="ah-help is-error">
                    <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: "middle", marginRight: 4 }}>error</span>
                    Passwords do not match
                  </span>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 20, cursor: "pointer" }}
              onClick={() => setAgreed((a) => !a)}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, border: agreed ? "none" : "2px solid var(--border-strong)",
                background: agreed ? "var(--primary)" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all .15s",
              }}>
                {agreed && <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#fff" }}>check</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.5 }}>
                I agree to the{" "}
                <a href="#" style={{ color: "var(--primary)", fontWeight: 700 }} onClick={(e) => e.stopPropagation()}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color: "var(--primary)", fontWeight: 700 }} onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ah-btn ah-btn-primary ah-btn-lg ah-btn-block"
              style={{ marginTop: 22 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
