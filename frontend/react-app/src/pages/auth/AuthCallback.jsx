import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
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
        // 1. Wait for Supabase to process the OAuth code and establish session
        const session = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("timeout")), 10000);

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, sess) => {
              if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve(sess);
              }
            }
          );

          // Also try immediately in case session is already available
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) {
              clearTimeout(timeout);
              subscription.unsubscribe();
              resolve(s);
            }
          });
        });

        if (!session || cancelled) return;

        // 2. Exchange Supabase token for the app's own JWT via backend
        setStatusMsg("Verifying your account…");
        const { data } = await api.post("/public/auth/social", {
          supabase_access_token: session.access_token,
        });

        // 3. Store the app's JWT — same flow as email/password login
        await loginUser(data.access_token);

        // 4. Redirect based on role
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        const role = payload?.role ?? "guest";
        if (role === "super_admin" || role === "hotel_admin") {
          navigate("/admin", { replace: true });
        } else if (role === "staff") {
          navigate("/staff/bookings", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Auth callback error:", err);
          navigate("/login?error=google_failed", { replace: true });
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
