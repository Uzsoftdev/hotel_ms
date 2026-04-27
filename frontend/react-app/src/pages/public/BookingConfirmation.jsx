import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();

  const bookingId = searchParams.get("booking_id") || state?.bookingId || "—";
  const room      = state?.room || null;
  const checkIn   = state?.checkIn  || searchParams.get("check_in")  || "—";
  const checkOut  = state?.checkOut || searchParams.get("check_out") || "—";
  const guests    = state?.guests   || searchParams.get("guests")    || "—";
  const total     = state?.total    || searchParams.get("total")     || "—";

  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const nextSteps = [
    { icon: "mail",          title: "Check Your Email",    desc: "A confirmation with full details has been sent to your inbox." },
    { icon: "luggage",       title: "Prepare for Arrival", desc: "Check-in opens at 3 PM. Bring a valid ID and your booking reference." },
    { icon: "support_agent", title: "Need Help?",          desc: "Our concierge team is available 24/7 for any requests or questions." },
  ];

  const refCode = bookingId !== "—" ? `AZH-${String(bookingId).padStart(4,"0")}` : "—";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "64px 24px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
        {/* ── Success icon + headline ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 48, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "all .7s" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 44, color: "var(--success)" }}>check_circle</span>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 16px", borderRadius: "var(--radius-pill)", background: "var(--primary-light)", color: "var(--primary)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Booking {refCode}
          </span>
          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.025em", color: "var(--text)", marginBottom: 12 }}>You're all set!</h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-secondary)", maxWidth: 400, lineHeight: 1.6 }}>
            Your reservation is confirmed. We look forward to welcoming you.
          </p>
        </div>

        {/* ── Booking ref card ── */}
        <div className="ah-card" style={{ overflow: "hidden", marginBottom: 32, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "all .7s .1s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {/* Image side */}
            <div style={{ position: "relative", minHeight: 220, background: "linear-gradient(135deg,#1e3a8a,#2563eb)", overflow: "hidden" }}>
              {room?.image ? (
                <img src={room.image} alt={room.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
              ) : null}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(15,23,42,.1),rgba(15,23,42,.5))" }} />
              {/* QR placeholder */}
              <div style={{ position: "absolute", bottom: 20, right: 20, width: 80, height: 80, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 44, color: "rgba(255,255,255,.6)" }}>qr_code</span>
              </div>
              <div style={{ position: "absolute", bottom: 20, left: 20, color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7, marginBottom: 4 }}>Skip front desk</div>
                <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Scan QR on arrival</div>
              </div>
            </div>

            {/* Details side */}
            <div style={{ padding: 28 }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, fontWeight: 700, color: "var(--primary)", marginBottom: 6 }}>{refCode}</div>
              <span className="ah-badge ah-badge-confirmed" style={{ marginBottom: 20, display: "inline-flex" }}>Confirmed</span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px", marginBottom: 20 }}>
                {[
                  { label: "Check-in",  value: checkIn },
                  { label: "Check-out", value: checkOut },
                  { label: "Guests",    value: guests !== "—" ? `${guests} guest${Number(guests) !== 1 ? "s" : ""}` : "—" },
                  { label: "Room",      value: room?.name || room?.category || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 4 }}>Total paid</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>
                    {total !== "—" ? `$${Number(total).toLocaleString()}` : "—"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <Link to="/my-bookings" className="ah-btn ah-btn-primary ah-btn-block">View My Bookings</Link>
                <Link to="/"           className="ah-btn ah-btn-secondary ah-btn-block">Back to Home</Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── What's next ── */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "all .7s .2s" }}>
          <div className="ah-eyebrow" style={{ textAlign: "center", marginBottom: 20 }}>What's next</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {nextSteps.map(({ icon, title, desc }) => (
              <div key={title} className="ah-card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>{icon}</span>
                </div>
                <h4 style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, fontWeight: 500 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
