import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import BookingSearchBar from "../../components/public/BookingSearchBar";
import AIHelper from "../../components/public/AIHelper";
import { ROOMS } from "../../data/rooms";

const SERIF = "'Playfair Display', Georgia, serif";

// Unsplash images keyed to section content
const IMG = {
  terraceDawn:  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80",
  breakfast:    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  privateCove:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
  coffee:       "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
  swim:         "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80",
  cabana:       "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=400&q=80",
  spa:          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
  cocktail:     "https://images.unsplash.com/photo-1514362545857-3f9f3f8def36?w=400&q=80",
  dining:       "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&q=80",
  stars:        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&q=80",
  reviewGuest1: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=300&q=80",
  reviewGuest2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  reviewGuest3: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80",
  reviewGuest4: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=300&q=80",
};

const TIMELINE = [
  { time: "06:42", label: "Coffee on the terrace", img: IMG.coffee },
  { time: "08:30", label: "Chef's breakfast",      img: IMG.breakfast },
  { time: "10:15", label: "A swim in the cove",    img: IMG.swim },
  { time: "12:00", label: "Cabana for two",        img: IMG.cabana },
  { time: "14:30", label: "Spa, slow afternoon",   img: IMG.spa },
  { time: "17:45", label: "Sundowner cocktails",   img: IMG.cocktail },
  { time: "19:30", label: "Coral · table four",    img: IMG.dining },
  { time: "22:00", label: "Star-gazing terrace",   img: IMG.stars },
];

const REVIEWS = [
  { name: "Sofía R.",      stay: "Atlantic Sunrise · 5 nights", quote: "The kind of place where time bends. We extended twice and still left too soon.",          rotate: -5, img: IMG.reviewGuest1 },
  { name: "Marcus T.",     stay: "Penthouse Horizon · 7 nights", quote: "Service so anticipatory it felt like mind reading. Already booking for next year.",         rotate: 4,  img: IMG.reviewGuest2 },
  { name: "Aiko & Jun",   stay: "Penthouse · 7 nights",          quote: "Honeymoon perfection. The private pool at sunset will live in our memory.",                rotate: -2, img: IMG.reviewGuest3 },
  { name: "The Reyes family", stay: "Atlantic Sunrise · 4 nights", quote: "Three generations, one suite. Even Pippa got a bed. Coming back in August.",           rotate: 6,  img: IMG.reviewGuest4 },
];

const ROOM_BADGE = ["Most loved", "Only 2 left", "A quiet pick"];

const STORY_CARDS = [
  { top: "0%",  left: "20%", rotate: -8, img: IMG.terraceDawn,  label: "Terrace at dawn"   },
  { top: "22%", right: "0%", rotate:  7, img: IMG.breakfast,    label: "Garden breakfast"  },
  { top: "52%", left: "0%",  rotate: -3, img: IMG.privateCove,  label: "The private cove"  },
];

function useInView(threshold = 0.1) {
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

// Birds flying over the ocean
const BIRDS = [
  { top: "11%", size: 20, dur: "16s", delay: "0s"   },
  { top: "18%", size: 13, dur: "22s", delay: "5s"   },
  { top: "7%",  size: 11, dur: "30s", delay: "9s"   },
  { top: "23%", size: 17, dur: "18s", delay: "13s"  },
  { top: "14%", size: 12, dur: "26s", delay: "2.5s" },
  { top: "9%",  size: 9,  dur: "34s", delay: "17s"  },
];

// Fixed sparkle positions (avoid Math.random in render)
const SPARKLES = [
  { top: "79%", left: "12%", w: 38, delay: "0s"    },
  { top: "82%", left: "28%", w: 22, delay: "1.1s"  },
  { top: "77%", left: "45%", w: 50, delay: "0.5s"  },
  { top: "84%", left: "60%", w: 30, delay: "1.8s"  },
  { top: "80%", left: "74%", w: 44, delay: "0.8s"  },
  { top: "86%", left: "88%", w: 26, delay: "2.2s"  },
  { top: "76%", left: "35%", w: 18, delay: "1.5s"  },
  { top: "83%", left: "52%", w: 36, delay: "0.3s"  },
];

function OceanScene() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>

      {/* ── SKY gradient ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #0369a1 0%, #0ea5e9 18%, #38bdf8 36%, #7dd3fc 52%, #bae6fd 63%, #e0f2fe 70%, #fef9c3 76%, #fde68a 80%)",
      }} />

      {/* ── SUN ── */}
      <div style={{
        position: "absolute", top: "32%", left: "62%",
        transform: "translate(-50%,-50%)",
        width: 96, height: 96, borderRadius: "50%",
        background: "radial-gradient(circle, #fffde7 0%, #fff9c4 38%, rgba(254,243,199,.55) 68%, transparent 100%)",
        animation: "sunRise 5s ease-in-out infinite",
        zIndex: 2,
      }} />

      {/* Sun rays — slowly rotating container */}
      <div style={{
        position: "absolute", top: "32%", left: "62%",
        zIndex: 2, transformOrigin: "0 0",
        animation: "slowSpin 28s linear infinite",
      }}>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
          <div key={deg} style={{
            position: "absolute",
            width: 2, height: 55,
            background: "linear-gradient(to bottom, rgba(254,243,199,.48) 0%, transparent 100%)",
            transformOrigin: "top center",
            transform: `translate(-50%,-100%) rotate(${deg}deg)`,
            filter: "blur(1px)",
          }} />
        ))}
      </div>

      {/* Flying birds */}
      {BIRDS.map((b, i) => (
        <div key={i} style={{
          position: "absolute", top: b.top, left: "-5%",
          zIndex: 5, pointerEvents: "none",
          animation: `birdFly ${b.dur} linear infinite`,
          animationDelay: b.delay,
        }}>
          <svg width={b.size} height={b.size * 0.5} viewBox="-12 -6 24 12" fill="none"
            style={{ animation: `wingFlap ${0.55 + i * 0.07}s ease-in-out infinite`, transformOrigin: "center center" }}>
            <path d="M-12,0 C-8,-5 -3,-6 0,-3 C3,-6 8,-5 12,0"
              stroke="rgba(10,20,55,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      ))}

      {/* Sun shimmer column on water */}
      <div style={{
        position: "absolute", top: "80%", left: "61%",
        transform: "translateX(-50%)",
        width: 70, height: "16%",
        background: "linear-gradient(to bottom, rgba(254,243,199,.55) 0%, rgba(254,243,199,.18) 55%, transparent 100%)",
        filter: "blur(6px)", borderRadius: "0 0 35px 35px",
        zIndex: 9,
      }} />

      {/* ── OCEAN base fill ── */}
      <div style={{
        position: "absolute", top: "80%", left: 0, right: 0, bottom: 0,
        background: "linear-gradient(180deg, #0c4a6e 0%, #0369a1 18%, #0284c7 36%, #0891b2 55%, #06b6d4 74%, #22d3ee 88%, #67e8f9 100%)",
      }} />

      {/* ── Horizon haze ── */}
      <div style={{
        position: "absolute", top: "78%", left: 0, right: 0, height: "3%",
        background: "linear-gradient(to bottom, rgba(224,242,254,.7) 0%, transparent 100%)",
        filter: "blur(8px)", zIndex: 3,
      }} />

      {/* ── WAVE 1 — horizon (ultra-flat, fast) ── */}
      <svg viewBox="0 0 2880 50" preserveAspectRatio="none"
        style={{ position:"absolute", top:"78%", left:0, width:"200%", height:"6%", zIndex:4,
          animation:"waveLeft 28s linear infinite" }}>
        <defs><linearGradient id="wg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a"/><stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient></defs>
        <path d="M0,25 C120,18 240,32 360,25 C480,18 600,32 720,25 C840,18 960,32 1080,25 C1200,18 1320,32 1440,25 C1560,18 1680,32 1800,25 C1920,18 2040,32 2160,25 C2280,18 2400,32 2520,25 C2640,18 2760,32 2880,25 L2880,50 L0,50 Z" fill="url(#wg1)"/>
      </svg>

      {/* ── WAVE 2 ── */}
      <svg viewBox="0 0 2880 70" preserveAspectRatio="none"
        style={{ position:"absolute", top:"80%", left:0, width:"200%", height:"9%", zIndex:5,
          animation:"waveRight 20s linear infinite" }}>
        <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#0369a1"/>
        </linearGradient></defs>
        <path d="M0,35 C240,14 480,56 720,35 C960,14 1200,56 1440,35 C1680,14 1920,56 2160,35 C2400,14 2640,56 2880,35 L2880,70 L0,70 Z" fill="url(#wg2)"/>
      </svg>

      {/* ── WAVE 3 ── */}
      <svg viewBox="0 0 2880 90" preserveAspectRatio="none"
        style={{ position:"absolute", top:"82%", left:0, width:"200%", height:"12%", zIndex:6,
          animation:"waveLeft 14s linear infinite" }}>
        <defs><linearGradient id="wg3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0369a1"/><stop offset="100%" stopColor="#0284c7"/>
        </linearGradient></defs>
        <path d="M0,45 C360,14 720,76 1080,45 C1440,14 1800,76 2160,45 C2520,14 2880,76 2880,45 L2880,90 L0,90 Z" fill="url(#wg3)"/>
      </svg>

      {/* ── WAVE 4 ── */}
      <svg viewBox="0 0 2880 110" preserveAspectRatio="none"
        style={{ position:"absolute", top:"85%", left:0, width:"200%", height:"16%", zIndex:7,
          animation:"waveRight 10s linear infinite" }}>
        <defs><linearGradient id="wg4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7"/><stop offset="100%" stopColor="#0891b2"/>
        </linearGradient></defs>
        <path d="M0,55 C480,16 960,94 1440,55 C1920,16 2400,94 2880,55 L2880,110 L0,110 Z" fill="url(#wg4)"/>
      </svg>

      {/* ── WAVE 5 — foreground (large, slowest) ── */}
      <svg viewBox="0 0 2880 140" preserveAspectRatio="none"
        style={{ position:"absolute", top:"88%", left:0, width:"200%", height:"20%", zIndex:8,
          animation:"waveLeft 7s linear infinite" }}>
        <defs><linearGradient id="wg5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0891b2"/><stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient></defs>
        {/* Wave body */}
        <path d="M0,70 C720,18 1440,122 2160,70 C2520,18 2880,122 2880,70 L2880,140 L0,140 Z" fill="url(#wg5)"/>
        {/* White foam crest */}
        <path d="M0,66 C360,44 720,82 1080,58 C1440,44 1800,78 2160,58 C2520,44 2880,68 2880,66 L2880,74 C2520,82 2160,64 1800,80 C1440,64 1080,82 720,64 C360,80 0,74 0,74 Z" fill="rgba(255,255,255,0.6)"/>
      </svg>

      {/* ── Water-surface sparkle glints ── */}
      {SPARKLES.map((s, i) => (
        <div key={i} style={{
          position: "absolute", top: s.top, left: s.left,
          width: s.w, height: 3, borderRadius: 2,
          background: "rgba(255,255,255,0.9)",
          filter: "blur(1px)", zIndex: 9,
          animation: `oceanSparkle ${2.5 + i * 0.4}s ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}

    </div>
  );
}

function PalmLeft({ refEl }) {
  return (
    <svg ref={refEl} viewBox="0 0 200 520" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", bottom: 0, left: -10, height: "76%", width: "auto", pointerEvents: "none", zIndex: 2, willChange: "transform" }}>
      {/* Trunk — stays still */}
      <path d="M80 520 Q74 400 80 300 Q86 220 80 150 Q76 110 72 70" stroke="#1e1b4b" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Fronds — gentle sway */}
      <g style={{ transformBox: "view-box", transformOrigin: "74px 72px", animation: "palmSway 3.8s ease-in-out infinite" }}>
        <path d="M72 70 Q20 35 -25 55 Q-42 62 -30 46 Q5 12 76 62" fill="#0f172a" opacity="0.88" />
        <path d="M72 78 Q30 -8 56 -40 Q66 -52 72 -36 Q76 8 80 72" fill="#0f172a" opacity="0.82" />
        <path d="M74 82 Q120 22 168 14 Q183 12 180 27 Q152 44 76 88" fill="#0f172a" opacity="0.82" />
        <path d="M74 90 Q130 72 178 92 Q188 100 178 107 Q144 104 76 95" fill="#0f172a" opacity="0.72" />
        <path d="M72 75 Q38 45 8 62 Q-3 70 4 77 Q30 75 74 80" fill="#0f172a" opacity="0.68" />
        <path d="M74 86 Q100 38 134 8 Q143 -2 148 8 Q140 42 78 90" fill="#0f172a" opacity="0.60" />
      </g>
    </svg>
  );
}

function PalmRight({ refEl }) {
  return (
    <svg ref={refEl} viewBox="0 0 200 520" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", bottom: 0, right: -10, height: "62%", width: "auto", pointerEvents: "none", zIndex: 2, transform: "scaleX(-1)", willChange: "transform" }}>
      {/* Trunk — stays still */}
      <path d="M80 520 Q74 400 80 300 Q86 220 80 150 Q76 110 72 70" stroke="#1e1b4b" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* Fronds — slight offset sway for natural feel */}
      <g style={{ transformBox: "view-box", transformOrigin: "74px 72px", animation: "palmSway 4.4s ease-in-out infinite", animationDelay: "0.7s" }}>
        <path d="M72 70 Q20 35 -25 55 Q-42 62 -30 46 Q5 12 76 62" fill="#0f172a" opacity="0.82" />
        <path d="M72 78 Q30 -8 56 -40 Q66 -52 72 -36 Q76 8 80 72" fill="#0f172a" opacity="0.76" />
        <path d="M74 82 Q120 22 168 14 Q183 12 180 27 Q152 44 76 88" fill="#0f172a" opacity="0.76" />
        <path d="M74 90 Q130 72 178 92 Q188 100 178 107 Q144 104 76 95" fill="#0f172a" opacity="0.66" />
        <path d="M74 86 Q100 38 134 8 Q143 -2 148 8 Q140 42 78 90" fill="#0f172a" opacity="0.55" />
      </g>
    </svg>
  );
}

export default function Home() {
  useAuth();
  const [tlStart, setTlStart] = useState(0);
  const featuredRooms = useMemo(() => ROOMS.slice(0, 3), []);

  // Parallax refs
  const heroContentRef = useRef(null);
  const heroTextRef    = useRef(null);   // opacity only — excludes search bar
  const palmLeftRef   = useRef(null);
  const palmRightRef  = useRef(null);

  // Scroll-driven parallax
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroContentRef.current)
          heroContentRef.current.style.transform = `translateY(${-y * 0.12}px)`;
        if (heroTextRef.current)
          heroTextRef.current.style.opacity = `${Math.max(0, 1 - y / 600)}`;
        if (palmLeftRef.current)
          palmLeftRef.current.style.transform = `translateY(${-y * 0.16}px)`;
        if (palmRightRef.current)
          palmRightRef.current.style.transform = `translateY(${-y * 0.1}px) scaleX(-1)`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openConcierge = () => window.dispatchEvent(new CustomEvent("ai-helper:open"));
  const openMaps = () => window.open(
    "https://www.google.com/maps/search/?api=1&query=1+Ocean+Drive+Miami+Beach+FL+33139",
    "_blank", "noopener"
  );

  const [storyRef, storyVisible] = useInView();
  const [roomsRef, roomsVisible] = useInView();
  const [tlRef,    tlVisible]    = useInView();
  const [revRef,   revVisible]   = useInView();
  const [locRef,   locVisible]   = useInView();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff", color: "#0f172a" }}>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        {/* ── Hand-crafted 3D ocean scene ── */}
        <OceanScene />

        {/* Bottom dark fade — merges ocean into page content */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
          background: "linear-gradient(transparent 52%, rgba(15,23,42,.48) 80%, rgba(15,23,42,.94) 100%)",
        }} />

        <div className="hidden sm:block" style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none" }}>
          <PalmLeft refEl={palmLeftRef} />
          <PalmRight refEl={palmRightRef} />
        </div>

        <Navbar transparent />

        {/* Hero content — parallax wrapper (transform only, no opacity here) */}
        <div ref={heroContentRef} style={{
          position: "relative", zIndex: 20,
          maxWidth: 1280, margin: "0 auto",
          padding: "clamp(40px,8vh,100px) clamp(24px,4vw,80px) 80px",
          minHeight: "calc(100vh - 0px)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          willChange: "transform",
        }}>

          {/* Text block — opacity fades on scroll, search bar stays solid */}
          <div ref={heroTextRef} style={{ willChange: "opacity" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", fontWeight: 600, margin: "0 0 22px" }}>
              Miami · South Beach · allstay.rest
            </p>

            <h1 style={{ margin: "0 0 18px", lineHeight: 0.9, color: "white" }}>
              <span style={{ display: "block", fontSize: "clamp(54px,8vw,124px)", fontWeight: 900, letterSpacing: "-0.04em" }}>Find your</span>
              <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(58px,8.8vw,132px)", fontWeight: 400, fontStyle: "italic", color: "#fcd34d", letterSpacing: "-0.02em" }}>horizon.</em>
            </h1>

            <p style={{ fontSize: "clamp(14px,1.2vw,17px)", color: "rgba(255,255,255,.72)", maxWidth: 400, marginTop: 18, fontWeight: 500, lineHeight: 1.68 }}>
              A boutique resort on Miami's most private beach. Sixty-four oceanfront suites, three Michelin restaurants, and a stretch of sand that's quietly yours.
            </p>
          </div>

          {/* Search bar — always fully opaque */}
          <div style={{ marginTop: 36, maxWidth: 860 }}>
            <BookingSearchBar />
          </div>
        </div>
      </section>

      {/* ═══ STORY ═══ */}
      <section ref={storyRef} style={{ background: "#0f172a", padding: "clamp(80px,10vw,140px) 0", overflow: "hidden" }}>
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center" style={{ maxWidth: 1280 }}>
          <div className={storyVisible ? "animate-fade-up" : "opacity-0"}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 700, marginBottom: 28 }}>✦ Chapter One</div>
            <h2 style={{ margin: 0, lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              <span style={{ display: "block", fontSize: "clamp(26px,3vw,50px)", fontWeight: 800, color: "white" }}>It begins the moment</span>
              <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(24px,2.8vw,46px)", fontWeight: 400, fontStyle: "italic", color: "#fcd34d" }}>you cross the threshold—</em>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.56)", maxWidth: 460, marginTop: 28, lineHeight: 1.8, fontWeight: 400 }}>
              Salt on the air. The doorman who remembers your son's name. A glass of something cold, pressed into your hand before you've thought to ask. By the time you reach your suite, you've already begun to slow down.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.35)", marginTop: 12, lineHeight: 1.7 }}>
              This is what we do, quietly, for sixty-four years and counting.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36 }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=85"
                alt="Carla Reyes"
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", objectPosition: "top", flexShrink: 0, border: "2px solid rgba(255,255,255,.2)" }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Carla Reyes</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.36)", fontWeight: 500 }}>General Manager · with us since 2011</div>
              </div>
            </div>
          </div>

          {/* Polaroid cards with real photos */}
          <div className="hidden lg:block" style={{ position: "relative", height: 440 }}>
            {STORY_CARDS.map((c, i) => (
              <div
                key={i}
                className={storyVisible ? "animate-fade-up" : "opacity-0"}
                style={{
                  position: "absolute",
                  top: c.top, left: c.left, right: c.right,
                  width: 158,
                  background: "white",
                  borderRadius: 8,
                  padding: "7px 7px 28px",
                  transform: `rotate(${c.rotate}deg)`,
                  boxShadow: "0 28px 80px rgba(0,0,0,.65)",
                  animationDelay: `${i * 180}ms`,
                  transition: "transform .3s, box-shadow .3s",
                  cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`; e.currentTarget.style.boxShadow = "0 40px 100px rgba(0,0,0,.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${c.rotate}deg)`; e.currentTarget.style.boxShadow = "0 28px 80px rgba(0,0,0,.65)"; }}
              >
                <img src={c.img} alt={c.label} style={{ width: "100%", height: 115, objectFit: "cover", borderRadius: 4, display: "block" }} />
                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginTop: 9, textAlign: "center", letterSpacing: "0.04em" }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ROOMS ═══ */}
      <section ref={roomsRef} style={{ background: "linear-gradient(180deg,#f8fafc 0%,#dbeafe 100%)", padding: "clamp(80px,10vw,140px) 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(24px,4vw,80px)" }}>
          <div className={roomsVisible ? "animate-fade-up" : "opacity-0"} style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b", fontWeight: 700, marginBottom: 16 }}>✦ The Rooms</div>
            <h2 style={{ margin: 0, lineHeight: 0.93, letterSpacing: "-0.04em" }}>
              <span style={{ display: "block", fontSize: "clamp(32px,4.5vw,70px)", fontWeight: 900, color: "#0f172a" }}>Some rooms are walls.</span>
              <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(30px,4.2vw,66px)", fontWeight: 400, fontStyle: "italic", color: "#2563EB" }}>These are windows.</em>
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 16, fontWeight: 500 }}>
              Every suite faces the Atlantic. Every balcony is its own private theatre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRooms.map((room, i) => (
              <Link
                key={room.id}
                to={`/room-details/${room.id}`}
                state={{ room }}
                className={roomsVisible ? "animate-fade-up" : "opacity-0"}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 4px 20px rgba(15,23,42,.08)",
                  animationDelay: `${i * 100}ms`,
                  transition: "transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 24px 64px rgba(15,23,42,.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,23,42,.08)"; }}
              >
                {/* Room photo */}
                <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
                  <img
                    src={room.image}
                    alt={room.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 55%)" }} />
                  <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(255,255,255,.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.35)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.04em" }}>
                    {ROOM_BADGE[i]}
                  </span>
                </div>
                {/* Card body */}
                <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>
                    {room.capacity || 2} guests · King bed
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{room.name}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6, flex: 1 }}>
                    {room.description.slice(0, 88)}…
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <div>
                      <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>${room.price_per_night}</span>
                      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}> /night</span>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "#2563EB" }}>
                      Explore <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link to="/hotels"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#2563EB", textDecoration: "none", border: "1.5px solid #2563EB", padding: "12px 28px", borderRadius: 10 }}>
              View all 64 rooms
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section ref={tlRef} style={{ padding: "clamp(80px,10vw,140px) 0", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg,#fff7ed 0%,#fed7aa 30%,#fbbf24 60%,#f59e0b 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 clamp(24px,4vw,80px)" }}>
          <div className={tlVisible ? "animate-fade-up" : "opacity-0"} style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(15,23,42,.42)", fontWeight: 700, marginBottom: 16 }}>✦ A Day, Captured</div>
            <h2 style={{ margin: 0, lineHeight: 0.95, letterSpacing: "-0.04em" }}>
              <span style={{ display: "block", fontSize: "clamp(36px,5.2vw,78px)", fontWeight: 900, color: "#0f172a" }}>Twelve hours</span>
              <span style={{ display: "block", fontSize: "clamp(36px,5.2vw,78px)", fontWeight: 900, color: "#0f172a" }}>of doing nothing,</span>
              <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(34px,5vw,74px)", fontWeight: 400, fontStyle: "italic", color: "#92400e" }}>beautifully.</em>
            </h2>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button
              onClick={() => setTlStart(s => Math.max(0, s - 1))}
              disabled={tlStart === 0}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(15,23,42,.2)", background: "rgba(255,255,255,.6)", cursor: tlStart === 0 ? "default" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", opacity: tlStart === 0 ? 0.4 : 1 }}
            >‹</button>
            <button
              onClick={() => setTlStart(s => Math.min(TIMELINE.length - 4, s + 1))}
              disabled={tlStart >= TIMELINE.length - 4}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(15,23,42,.2)", background: "rgba(255,255,255,.6)", cursor: tlStart >= TIMELINE.length - 4 ? "default" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", opacity: tlStart >= TIMELINE.length - 4 ? 0.4 : 1 }}
            >›</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIMELINE.slice(tlStart, tlStart + 4).map((item, i) => (
              <div
                key={item.time}
                className={tlVisible ? "animate-fade-up" : "opacity-0"}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "rgba(255,255,255,.45)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,.6)",
                  animationDelay: `${i * 80}ms`,
                  transition: "transform .3s, box-shadow .3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ height: 110, overflow: "hidden" }}>
                  <img src={item.img} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "16px 20px 20px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginTop: 4 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section ref={revRef} style={{ background: "#faf8f3", padding: "clamp(80px,10vw,140px) 0", overflow: "hidden" }}>
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center" style={{ maxWidth: 1280 }}>
          <div className={revVisible ? "animate-fade-up" : "opacity-0"}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b", fontWeight: 700, marginBottom: 28 }}>✦ Guest Postcards</div>
            <h2 style={{ margin: 0, lineHeight: 0.95, letterSpacing: "-0.04em" }}>
              <span style={{ display: "block", fontSize: "clamp(34px,4.8vw,70px)", fontWeight: 900, color: "#0f172a" }}>In our</span>
              <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(32px,4.5vw,66px)", fontWeight: 400, fontStyle: "italic", color: "#0f172a" }}>guests' own words.</em>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
              <span style={{ fontSize: 22, color: "#f59e0b", letterSpacing: 2 }}>★★★★★</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>4.9 / 5</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>2,847 verified guests</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
              These are real reviews from real stays — the kind we frame in the staff break room.
            </p>
            <Link to="/hotels"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#0f172a", textDecoration: "none", marginTop: 20, borderBottom: "1.5px solid #0f172a", paddingBottom: 2 }}>
              Read all reviews <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
            </Link>
          </div>

          {/* Polaroids with real guest photos — desktop */}
          <div className="hidden lg:block" style={{ position: "relative", height: 520 }}>
            {REVIEWS.map((r, i) => {
              const pos = [
                { top: "0%",  left: "20%" },
                { top: "14%", right: "0%" },
                { top: "44%", left: "0%" },
                { top: "60%", right: "12%" },
              ][i];
              return (
                <div
                  key={r.name}
                  className={revVisible ? "animate-fade-up" : "opacity-0"}
                  style={{
                    position: "absolute",
                    top: pos.top, left: pos.left, right: pos.right,
                    width: 190,
                    background: "white",
                    borderRadius: 8,
                    padding: "10px 10px 36px",
                    transform: `rotate(${r.rotate}deg)`,
                    boxShadow: "0 12px 40px rgba(15,23,42,.14)",
                    animationDelay: `${i * 150}ms`,
                    transition: "transform .3s, box-shadow .3s, z-index .3s",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "rotate(0deg) scale(1.06)"; e.currentTarget.style.boxShadow = "0 28px 70px rgba(15,23,42,.28)"; e.currentTarget.style.zIndex = 10; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${r.rotate}deg)`; e.currentTarget.style.boxShadow = "0 12px 40px rgba(15,23,42,.14)"; e.currentTarget.style.zIndex = 1; }}
                >
                  <img src={r.img} alt={r.name} style={{ width: "100%", height: 128, objectFit: "cover", borderRadius: 4, display: "block", marginBottom: 10 }} />
                  <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.6, margin: "0 0 8px", fontStyle: "italic" }}>
                    "{r.quote.length > 72 ? r.quote.slice(0, 72) + "…" : r.quote}"
                  </p>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>— {r.name}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{r.stay}</div>
                </div>
              );
            })}
          </div>

          {/* Mobile fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {REVIEWS.slice(0, 2).map(r => (
              <div key={r.name} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,.08)" }}>
                <img src={r.img} alt={r.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                <div style={{ padding: "16px 20px 20px" }}>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: "0 0 12px", fontStyle: "italic" }}>"{r.quote}"</p>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>— {r.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{r.stay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LOCATION ═══ */}
      <section ref={locRef} style={{ background: "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#93c5fd 100%)", padding: "clamp(80px,10vw,140px) 0" }}>
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center" style={{ maxWidth: 1280 }}>
          <div className={locVisible ? "animate-fade-up" : "opacity-0"}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3b82f6", fontWeight: 700, marginBottom: 20 }}>✦ Where to Find Us</div>
            <h2 style={{ margin: 0, lineHeight: 1.0, letterSpacing: "-0.04em" }}>
              <span style={{ display: "block", fontSize: "clamp(28px,3.8vw,56px)", fontWeight: 900, color: "#0f172a" }}>One Ocean Drive,</span>
              <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(26px,3.5vw,52px)", fontWeight: 400, fontStyle: "italic", color: "#1d4ed8" }}>and a private mile of sand.</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
              {[
                { icon: "location_on",   text: "1 Ocean Drive, Miami Beach, FL 33139" },
                { icon: "directions_car", text: "23 min from Miami International Airport" },
                { icon: "phone",          text: "+1 305 555 0140" },
                { icon: "mail",           text: "stay@allstay.rest" },
              ].map(({ icon, text }) => (
                <div key={icon} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#3b82f6" }}>{icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1e40af" }}>{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={openMaps}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#1d4ed8", background: "rgba(255,255,255,.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.75)", padding: "10px 20px", borderRadius: 8, cursor: "pointer", marginTop: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>map</span>
              Open in Maps
            </button>
          </div>

          <div className={locVisible ? "animate-fade-up" : "opacity-0"} style={{ animationDelay: "200ms" }}>
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 64px rgba(15,23,42,.18)", transform: "rotate(2deg)" }}>
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"
                alt="Miami Beach"
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>One Ocean Drive</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>Miami Beach, FL 33139 · United States</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>+1 305 555 0140 · stay@allstay.rest</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ position: "relative", padding: "clamp(100px,12vw,160px) 0", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(at 30% 100%, rgba(252,211,77,.5), transparent 60%),
            radial-gradient(at 70% 0%, rgba(220,38,38,.4), transparent 60%),
            linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#4338ca 60%,#7c3aed 80%,#0f172a 100%)
          `,
        }} />
        {["12% 20%", "78% 15%", "25% 75%", "88% 65%", "50% 40%", "62% 85%"].map((pos, i) => (
          <div key={i} style={{ position: "absolute", left: pos.split(" ")[0], top: pos.split(" ")[1], fontSize: i % 2 === 0 ? 18 : 11, color: "rgba(252,211,77,.35)", pointerEvents: "none" }}>✦</div>
        ))}

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 clamp(24px,4vw,80px)", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 20px", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            <span style={{ display: "block", fontSize: "clamp(46px,7vw,96px)", fontWeight: 900, color: "white" }}>Come find</span>
            <em style={{ display: "block", fontFamily: SERIF, fontSize: "clamp(48px,7.5vw,104px)", fontWeight: 400, fontStyle: "italic", color: "#fcd34d" }}>your horizon.</em>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", maxWidth: 420, margin: "24px auto 40px", lineHeight: 1.7 }}>
            May has openings. June is filling. Reserve before the season turns, and bring the people you love.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/hotels"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "white", textDecoration: "none", background: "rgba(255,255,255,.14)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.3)", padding: "14px 28px", borderRadius: 12 }}>
              Reserve a suite
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
            <button
              onClick={openConcierge}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.75)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", padding: "14px 24px", borderRadius: 12, cursor: "pointer" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
              Chat with the concierge
            </button>
          </div>
          <div style={{ marginTop: 52, fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,.2)", fontWeight: 700 }}>
            ✦ allStay · allstay.rest ✦
          </div>
        </div>
      </section>

      <Footer />
      <AIHelper />
    </div>
  );
}
