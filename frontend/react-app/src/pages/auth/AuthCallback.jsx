import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically picks up the OAuth tokens from the URL hash.
    // Just wait for the session to be confirmed, then redirect.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Redirect regular users to dashboard; staff/admin need email-based login.
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", flexDirection: "column", gap: 16,
      background: "var(--surface)", color: "var(--text)"
    }}>
      <span className="material-symbols-outlined"
        style={{ fontSize: 48, color: "var(--primary)", animation: "spin 1s linear infinite" }}>
        progress_activity
      </span>
      <p style={{ fontWeight: 600, fontSize: 15 }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
