import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";
import loginBack from "../../assets/images/background.png";

function EyeButton({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer",
        color: show ? "var(--primary)" : "var(--text-tertiary)",
        transition: "color .2s, transform .2s",
        display: "flex", alignItems: "center", padding: 2,
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1.15)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
      tabIndex={-1}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 19, transition: "opacity .2s", opacity: show ? 1 : 0.6 }}>
        {show ? "visibility" : "visibility_off"}
      </span>
    </button>
  );
}

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 40); }, []);

  function handleGoogleSignIn() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = encodeURIComponent("openid email profile");
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=select_account`;
    window.location.href = url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ username, password });
      await loginUser(res.data.access_token);
      const payload = JSON.parse(atob(res.data.access_token.split(".")[1]));
      const role = payload?.role ?? "";
      if (role === "super_admin" || role === "hotel_admin") navigate("/admin", { replace: true });
      else if (role === "staff") navigate("/staff/bookings", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.detail || data?.details?.[0]?.message?.replace(/^Value error,\s*/i, "") || data?.error;
      setError(msg || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fadeUp = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity .55s ease ${delay}s, transform .55s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Left: image panel ── */}
      <aside className="hidden lg:flex" style={{ flex: "0 0 48%", position: "relative", overflow: "hidden", flexDirection: "column", justifyContent: "space-between", padding: 56 }}>
        <img src={loginBack} alt="allStay" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,23,42,.82) 0%, rgba(37,99,235,.35) 100%)", zIndex: 1 }} />

        {/* Logo */}
        <div style={{ ...fadeUp(0), position: "relative", zIndex: 2 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}><span style={{ color: "#fff" }}>all</span><span style={{ color: "#93c5fd" }}>Stay</span></span>
          </Link>
        </div>

        {/* Center copy */}
        <div style={{ ...fadeUp(.12), position: "relative", zIndex: 2 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,.55)", marginBottom: 16 }}>
            ★★★★★ &nbsp; Miami · South Beach
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.05, color: "#fff", marginBottom: 16 }}>
            Your luxury<br />stay awaits.
          </h2>
          <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,.7)", lineHeight: 1.6, maxWidth: 340 }}>
            Sign in to manage your bookings, explore exclusive offers, and experience world-class hospitality.
          </p>
          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 32 }}>
            {[["4.9★", "Guest rating"], ["500+", "Rooms"], ["24/7", "Concierge"]].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{val}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ ...fadeUp(.22), position: "relative", zIndex: 2, borderLeft: "2px solid rgba(255,255,255,.25)", paddingLeft: 16 }}>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>
            "The finest luxury is the pleasure of being where you belong."
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>allStay</p>
        </div>
      </aside>

      {/* ── Right: form ── */}
      <div className="flex flex-col justify-center items-center overflow-y-auto bg-white px-5 py-10 sm:px-8 sm:py-12" style={{ flex: 1 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ ...fadeUp(0), marginBottom: 32 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>hotel</span>
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}><span style={{ color: "#0f172a" }}>all</span><span style={{ color: "#2563EB" }}>Stay</span></span>
            </Link>
          </div>

          {/* Heading */}
          <div style={fadeUp(.06)}>
            <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", color: "var(--text)", marginBottom: 6 }}>Sign in</h1>
            <p className="ah-muted" style={{ fontSize: 14, marginBottom: 28 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Create one free</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ ...fadeUp(0), display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "var(--error-bg)", borderRadius: 8, marginBottom: 20, color: "var(--error)", fontSize: 13, fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, flexShrink: 0 }}>error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email */}
            <div style={fadeUp(.1)} className="ah-field">
              <label className="ah-label">Email address</label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-tertiary)", pointerEvents: "none" }}>mail</span>
                <input
                  className="ah-input"
                  type="email"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={fadeUp(.14)} className="ah-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="ah-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-tertiary)", pointerEvents: "none" }}>lock</span>
                <input
                  className="ah-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <EyeButton show={showPw} onToggle={() => setShowPw((s) => !s)} />
              </div>
            </div>

            {/* Remember me */}
            <div style={{ ...fadeUp(.17), display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              onClick={() => setRemember((r) => !r)}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                border: remember ? "none" : "2px solid var(--border-strong)",
                background: remember ? "var(--primary)" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all .15s",
              }}>
                {remember && <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#fff" }}>check</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Keep me signed in</span>
            </div>

            {/* Submit */}
            <div style={fadeUp(.2)}>
              <button
                type="submit"
                disabled={loading}
                className="ah-btn ah-btn-primary ah-btn-lg ah-btn-block"
                style={{ marginTop: 4, position: "relative", overflow: "hidden" }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>progress_activity</span>
                    Signing in…
                  </span>
                ) : "Sign in"}
              </button>
            </div>
          </form>

          {/* OR divider */}
          <div style={{ ...fadeUp(.23), display: "flex", alignItems: "center", gap: 12, margin: "24px 0", color: "var(--text-tertiary)", fontSize: 12, fontWeight: 700 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            OR
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Social buttons */}
          <div style={{ ...fadeUp(.26), display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              className="ah-btn ah-btn-secondary ah-btn-block"
              style={{ justifyContent: "flex-start", paddingLeft: 14, gap: 12 }}
              onClick={handleGoogleSignIn}
            >
              {/* Official Google logo SVG */}
              <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span style={{ flex: 1, textAlign: "center" }}>Continue with Google</span>
            </button>
          </div>

          <p style={{ ...fadeUp(.29), textAlign: "center", fontSize: 13, marginTop: 24, color: "var(--text-secondary)", fontWeight: 600 }}>
            New here?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Create an account</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
