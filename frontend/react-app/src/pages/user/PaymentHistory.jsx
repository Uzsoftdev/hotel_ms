import { useEffect, useState } from "react";
import UserLayout from "./Layout/UserLayout";
import { getPaymentHistory } from "../../services/user";

const BADGE = {
  succeeded: "ah-badge-confirmed",
  pending:   "ah-badge-pending",
  failed:    "ah-badge-cancelled",
  refunded:  "ah-badge-completed",
};
const BADGE_LABEL = {
  succeeded: "Paid",
  pending:   "Pending",
  failed:    "Failed",
  refunded:  "Refunded",
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getPaymentHistory()
      .then((r) => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <UserLayout>
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 className="ah-h1" style={{ fontSize: 32 }}>Payment history</h1>
          {!loading && payments.length > 0 && (
            <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "8px 16px", borderRadius: "var(--radius-pill)", fontSize: 13, fontWeight: 700 }}>
              Total paid: ${total.toLocaleString()}
            </div>
          )}
        </div>

        {/* Table card */}
        {loading ? (
          <div className="ah-card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Date", "Booking", "Amount", "Method", "Status", ""].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                    {Array(6).fill(0).map((__, j) => (
                      <td key={j} style={{ padding: "14px 20px" }}>
                        <div className="ah-skeleton" style={{ height: 14, width: j === 5 ? 60 : "80%" }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : payments.length === 0 ? (
          <div className="ah-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 28 }}>receipt_long</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>No payment records yet</p>
            <p className="ah-muted" style={{ fontSize: 13, marginTop: 6 }}>Your transactions will appear here after your first booking.</p>
          </div>
        ) : (
          <div className="ah-card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                  {["Date", "Booking", "Amount", "Method", "Status", ""].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const date = p.created_at
                    ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  return (
                    <tr key={p.id} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600 }}>{date}</td>
                      <td style={{ padding: "14px 20px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>#{p.booking_id}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 800 }}>${Number(p.amount).toLocaleString()}</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, textTransform: "uppercase" }}>{p.method || "—"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`ah-badge ${BADGE[p.status] || "ah-badge-completed"}`}>
                          {BADGE_LABEL[p.status] || p.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        {p.transaction_id && (
                          <button
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => alert(`Transaction ID: ${p.transaction_id}`)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span> Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
