import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import BookingSearchBar from "../../components/public/BookingSearchBar";
import AIHelper from "../../components/public/AIHelper";
import { ROOMS } from "../../data/rooms";

import oceanSuite from "../../assets/images/ocean_suite.png";

const FACILITIES = [
  { icon: "pool",             label: "Infinity Pool",   desc: "Three pools, ocean-edge cabanas" },
  { icon: "spa",              label: "Coral Spa",       desc: "12 treatment rooms, hammam" },
  { icon: "restaurant",       label: "Michelin Dining", desc: "Four restaurants, two starred" },
  { icon: "fitness_center",   label: "Wellness Club",   desc: "24/7 gym, yoga deck, pilates" },
  { icon: "directions_boat",  label: "Marina Access",   desc: "Yacht charters & water sports" },
  { icon: "child_care",       label: "Kids' Club",      desc: "Ages 4–12, all day" },
];

const REVIEWS = [
  { name: "Sofía R.",   avatar: "SR", stay: "Atlantic Sunrise Suite · 5 nights", rating: 5, quote: "The kind of place where time bends. We extended twice and still left too soon.", color: "linear-gradient(135deg,#818CF8,#6366F1)" },
  { name: "Marcus T.",  avatar: "MT", stay: "Coral Garden Room · 3 nights",       rating: 5, quote: "Service so anticipatory it felt like mind reading. The breakfast on the terrace alone is worth the trip.", color: "linear-gradient(135deg,#34D399,#059669)" },
  { name: "Aiko & Jun", avatar: "AJ", stay: "Penthouse Horizon · 7 nights",      rating: 5, quote: "Honeymoon perfection. The private pool at sunset will live in our memory forever.", color: "linear-gradient(135deg,#F472B6,#BE185D)" },
];

const TRUST_ITEMS = [
  "★★★★★ Forbes Travel Guide",
  "AAA Five Diamond",
  "Condé Nast Top 10",
  "Michelin Key 2026",
  "Travel + Leisure 100",
];

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function Home() {
  useTranslation("pub_translation");
  useAuth();

  const [roomsRef, roomsVisible] = useInView();
  const [facRef,   facVisible]   = useInView();
  const [revRef,   revVisible]   = useInView();

  const featuredRooms = useMemo(() => ROOMS.slice(0, 3), []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-slate-900 min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "88vh", background: "#0f172a", overflow: "hidden" }}>
        <img
          src={oceanSuite}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.68) 100%)" }} />

        <div className="relative z-10 flex flex-col justify-center" style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(80px,12vw,160px) clamp(24px,4vw,80px) 140px", minHeight: "88vh" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>
            ★★★★★ &nbsp; Miami · South Beach
          </div>
          <h1 style={{ fontSize: "clamp(44px,6vw,82px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: 0, maxWidth: 760, color: "white" }}>
            Where the<br />Atlantic meets<br />
            <em style={{ fontWeight: 400, fontStyle: "italic" }}>quiet luxury.</em>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.88)", maxWidth: 480, marginTop: 20, fontWeight: 500, lineHeight: 1.6 }}>
            Oceanfront suites, three-time Michelin dining, and a private stretch of South Beach.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Link to="/hotels"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: "#2563EB", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none", transition: "opacity .15s" }}
              onMouseOver={e => e.currentTarget.style.opacity = ".88"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}>
              Check availability
            </Link>
            <button
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 24px", borderRadius: 10, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "white", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.28)", cursor: "pointer" }}>
              Take the tour →
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 56, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.18)" }}>
            {[
              { value: "4.9", sub: "2,847 reviews" },
              { value: "64",  sub: "oceanfront suites" },
              { value: "1mi", sub: "private beach" },
            ].map(({ value, sub }) => (
              <div key={sub}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "white" }}>{value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, marginTop: 3 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating search bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20" style={{ transform: "translateY(50%)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <BookingSearchBar />
          </div>
        </div>
      </section>

      {/* Spacer so content clears the floating search bar */}
      <div style={{ height: 64 }} />

      {/* ── FEATURED ROOMS ── */}
      <section ref={roomsRef} style={{ padding: "80px 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex justify-between items-end mb-10 ${roomsVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#2563EB", marginBottom: 8 }}>
                Suites & Rooms
              </div>
              <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>
                Designed to slow you down
              </h2>
            </div>
            <Link to="/hotels" className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline" style={{ textDecoration: "none" }}>
              View all 64 rooms
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRooms.map((room, i) => (
              <Link
                key={room.id}
                to={`/room-details/${room.id}`}
                state={{ room }}
                className={`group block rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl transition-all duration-300 ${roomsVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 80}ms`, textDecoration: "none" }}
              >
                <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
                  {i === 0 && (
                    <span style={{ position: "absolute", top: 12, left: 12, background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                      Most loved
                    </span>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 15, margin: "0 0 6px", color: "#0f172a" }}>{room.name}</h3>
                  <div style={{ display: "flex", gap: 10, color: "#64748b", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                    <span>
                      <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: "middle" }}>group</span>
                      {" "}{room.capacity || "2 guests"}
                    </span>
                    <span>·</span>
                    <span>★ {room.rating}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {(room.amenities || []).slice(0, 3).map((a) => (
                      <span key={a} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>{a}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                    <div>
                      <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a" }}>${room.price_per_night}</span>
                      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>/night</span>
                    </div>
                    <span style={{ background: "#2563EB", color: "white", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/hotels"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #2563EB", color: "#2563EB", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              View all rooms
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section ref={facRef} style={{ padding: "0 0 80px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`mb-10 ${facVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#2563EB", marginBottom: 8 }}>
              Property
            </div>
            <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>
              Everything within reach
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {FACILITIES.map((fac, i) => (
              <div
                key={fac.label}
                className={`rounded-2xl border border-slate-100 p-6 flex gap-4 hover:shadow-md hover:border-blue-100 transition-all ${facVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eff6ff", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{fac.icon}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{fac.label}</div>
                  <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{fac.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section ref={revRef} style={{ padding: "80px 0", borderTop: "1px solid #f1f5f9" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`mb-10 ${revVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#2563EB", marginBottom: 8 }}>
              Guest reviews · 4.9 / 5
            </div>
            <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>
              What our guests are saying
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {REVIEWS.map((r, i) => (
              <div
                key={r.name}
                className={`rounded-2xl border border-slate-100 p-8 hover:shadow-lg transition-shadow ${revVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-amber-400" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, fontWeight: 500, color: "#1e293b", margin: "0 0 20px" }}>
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: r.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{r.stay}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ROW ── */}
      <section style={{ padding: "28px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 40px", color: "#64748b", fontSize: 13, fontWeight: 700 }}>
            {TRUST_ITEMS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <AIHelper />
    </div>
  );
}
