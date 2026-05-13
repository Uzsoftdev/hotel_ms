import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes — Supabase fires SIGNED_IN
    // after it processes the OAuth tokens from the URL hash/code.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard", { replace: true });
      }
    });

    // Also handle the case where the session is already present
    // (e.g. user refreshes the callback page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });

    // If nothing happens after 8 seconds, send back to login
    const timeout = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
