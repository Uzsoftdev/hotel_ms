import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [statusMsg, setStatusMsg] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // Read ?code= from the URL (direct Google OAuth redirect)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          navigate("/login?error=no_code", { replace: true });
          return;
        }

        setStatusMsg("Verifying your account…");

        // redirect_uri must match exactly what was used in the initial OAuth request.
        // Use the same env-var override as Login.jsx so they always agree.
        const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
        const { data } = await api.post("/public/auth/google", { code, redirect_uri: redirectUri });

        if (cancelled) return;

        // Store the app's JWT — same flow as email/password login
        await loginUser(data.access_token);

        // Redirect based on role
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        const role = payload?.role ?? "guest";
        if (role === "super_admin" || role === "hotel_admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (role === "staff") {
          navigate("/staff/bookings", { replace: true });
        } else {
          navigate("/user/dashboard", { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.detail || "";
          const msg = detail ? encodeURIComponent(detail) : "";
          navigate(`/login?error=google_failed${msg ? `&detail=${msg}` : ""}`, { replace: true });
        }
      }
    }

    handleCallback();
    return () => { cancelled = true; };
  }, [navigate, loginUser]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", flexDirection: "column", gap: 16,
      background: "var(--surface)", color: "var(--text)"
    }}>
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 48, color: "var(--primary)", animation: "spin 1s linear infinite" }}
      >
        progress_activity
      </span>
      <p style={{ fontWeight: 600, fontSize: 15 }}>{statusMsg}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
