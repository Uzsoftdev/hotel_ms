import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import BookingSearchBar from "../../components/public/BookingSearchBar";
import AIHelper from "../../components/public/AIHelper";
import { ROOMS } from "../../data/rooms";

import parisImage from "../../assets/images/paris_1.png";
import baliImage from "../../assets/images/bali_1.png";
import newyorkImage from "../../assets/images/new_york_1.png";
import oceanSuite from "../../assets/images/ocean_suite.png";
import hotel3 from "../../assets/images/hotel3.png";
import poolInfinity from "../../assets/images/pool_infinity.png";
import room2 from "../../assets/images/room2.png";

const DESTINATIONS = [
  { name: "Paris", country: "France", flag: "🇫🇷", tagline: "City of lights & love", hotels: "124 stays", image: parisImage, color: "from-rose-900/80" },
  { name: "Bali", country: "Indonesia", flag: "🇮🇩", tagline: "Tropical paradise", hotels: "89 stays", image: baliImage, color: "from-emerald-900/80" },
  { name: "New York", country: "United States", flag: "🇺🇸", tagline: "The city that never sleeps", hotels: "312 stays", image: newyorkImage, color: "from-blue-900/80" },
];

const PERKS = [
  { icon: "support_agent", title: "24/7 Concierge", desc: "Round-the-clock personal assistance for every need, day or night." },
  { icon: "price_check", title: "Best Rate Promise", desc: "We match any lower price you find — no questions asked." },
  { icon: "spa", title: "Curated Luxury", desc: "Every room hand-picked and verified for exceptional standards." },
  { icon: "lock", title: "Secure Booking", desc: "Bank-grade encryption keeps your personal data safe." },
];

const REVIEWS = [
  { name: "Alexandra S.", location: "London, UK", rating: 5, text: "Absolutely breathtaking. The concierge arranged a private dinner on the terrace — a night I'll never forget.", avatar: "AS", stay: "Grand Ocean Suite" },
  { name: "James V.", location: "Toronto, CA", rating: 5, text: "The most comfortable bed I've ever slept in. Check-in was seamless, and the staff remembered our names throughout.", avatar: "JV", stay: "Horizon Deluxe Suite" },
  { name: "Marie L.", location: "Paris, FR", rating: 5, text: "Je reviendrai certainement. The room was immaculate, the views stunning, and the breakfast simply magnificent.", avatar: "ML", stay: "Azure Standard King" },
];


function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function Home() {
  const { t } = useTranslation("pub_translation");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [perksRef, perksVisible] = useInView();
  const [roomsRef, roomsVisible] = useInView();
  const [reviewsRef, reviewsVisible] = useInView();
  const [destRef, destVisible] = useInView();

  const featuredRooms = useMemo(() => ROOMS.slice(0, 4), []);

  function quickFill(dest) {
    // destination cards pass the name, but search is handled by BookingSearchBar
    navigate(`/search?location=${encodeURIComponent(dest)}`);
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-white pt-8 md:pt-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* LEFT — text content */}
            <div className="py-4 lg:py-8">
              {/* Tag pills */}
              <div className="flex flex-wrap gap-2 mb-6 md:mb-7">
                <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "4px 12px", borderRadius: 20 }}>★★★★★</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", padding: "4px 12px", borderRadius: 20 }}>MIAMI</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "4px 12px", borderRadius: 20 }}>EST. 2012</span>
              </div>

              {/* Headline */}
              <h1 className="font-black tracking-tight text-slate-900 mb-4 md:mb-5" style={{ fontSize: "clamp(38px, 5.5vw, 68px)", lineHeight: 1.02, letterSpacing: "-0.035em" }}>
                Horizon<br />of your own.
              </h1>

              {/* Subtitle */}
              <p className="text-slate-500 leading-relaxed mb-8 md:mb-9" style={{ fontSize: 16, maxWidth: 380 }}>
                Sixty-four oceanfront suites and residences on a private mile of South Beach. Open year-round.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-10 md:mb-12">
                <Link to="/hotels" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm text-white" style={{ background: "#1d4ed8", textDecoration: "none" }}>
                  Check availability
                </Link>
                <Link to="/about" className="inline-flex items-center gap-1.5 font-semibold text-sm text-slate-900" style={{ textDecoration: "none" }}>
                  Take the tour <span>→</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-0">
                {[
                  { value: "4.9", sub: "2,847 reviews" },
                  { value: "64", sub: "oceanfront suites" },
                  { value: "1mi", sub: "private beach" },
                ].map(({ value, sub }, i) => (
                  <div key={sub} className="flex items-center">
                    <div className="pr-5 sm:pr-7">
                      <p className="font-extrabold text-slate-900 m-0" style={{ fontSize: 22, lineHeight: 1.1 }}>{value}</p>
                      <p className="text-slate-400 m-0" style={{ fontSize: 11, marginTop: 3 }}>{sub}</p>
                    </div>
                    {i < 2 && <div className="mr-5 sm:mr-7 shrink-0" style={{ width: 1, height: 32, background: "#e2e8f0" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — image cards (hidden on mobile, visible md+) */}
            <div className="hidden md:grid grid-cols-2 gap-3" style={{ gridTemplateRows: "190px 190px" }}>
              {/* Tall left */}
              <div className="rounded-2xl overflow-hidden relative" style={{ gridRow: "1 / 3" }}>
                <img src={oceanSuite} alt="Grand Ocean Suite" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
                <div className="absolute bottom-5 left-5">
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, margin: 0 }}>Grand / Ocean Suite</p>
                </div>
              </div>
              {/* Top right */}
              <div className="rounded-2xl overflow-hidden relative">
                <img src={hotel3} alt="Sky Suite" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                <div className="absolute bottom-3.5 left-3.5">
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, margin: 0 }}>Sky Suite</p>
                </div>
              </div>
              {/* Bottom right */}
              <div className="rounded-2xl overflow-hidden relative">
                <img src={poolInfinity} alt="Infinity Pool" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                <div className="absolute bottom-3.5 left-3.5">
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, margin: 0 }}>Infinity Pool</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-12 pb-10 mt-6 md:mt-10">
          <BookingSearchBar />
        </div>
      </section>

      {/* ── PERKS ── */}
      <section ref={perksRef} className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map(({ icon, title, desc }, i) => (
            <div key={title}
              className={`group p-6 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 card-hover ${perksVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <h3 className="font-extrabold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section ref={roomsRef} className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-end justify-between mb-12 ${roomsVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Handpicked for you</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Featured stays</h2>
              <p className="text-slate-500 mt-2 font-medium">Our most-loved rooms, loved by thousands of guests</p>
            </div>
            <Link to="/hotels" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              View all rooms <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRooms.map((room, i) => (
              <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-400 card-hover ${roomsVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-[4/3] overflow-hidden relative img-zoom">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/95 text-primary px-2.5 py-1 rounded-full shadow-sm">
                      {room.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm text-slate-400" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                  </button>
                  {/* Rating badge */}
                  <div className="absolute bottom-3 right-3 glass px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-400 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-white">{room.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-slate-900 mb-1 text-sm leading-tight group-hover:text-primary transition-colors">{room.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="material-symbols-outlined text-amber-400 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold text-slate-700">{room.rating}</span>
                    <span className="text-xs text-slate-400">({room.reviews})</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    {room.amenities.slice(0, 2).map((a, idx) => (
                      <div key={a} className="flex items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-xs">{room.amenityIcons[idx]}</span>
                        <span className="text-[10px] font-semibold">{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold">From</span>
                      <p className="text-lg font-extrabold text-slate-900">${room.price_per_night}<span className="text-xs font-medium text-slate-400">/night</span></p>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Free cancel
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/hotels" className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/5 transition-all">
              View all rooms <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section ref={destRef} className="max-w-7xl mx-auto px-6 py-24">
        <div className={`mb-12 ${destVisible ? "animate-fade-up" : "opacity-0"}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Explore the world</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Top destinations</h2>
          <p className="text-slate-500 mt-2 font-medium">Find your next adventure among our most popular locations</p>
        </div>

        {/* Magazine grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[260px]">
          {/* Large card */}
          <div
            className={`md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden cursor-pointer group img-zoom ${destVisible ? "animate-fade-up delay-100" : "opacity-0"}`}
            onClick={() => quickFill(DESTINATIONS[0].name)}>
            <img src={DESTINATIONS[0].image} alt={DESTINATIONS[0].name} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${DESTINATIONS[0].color} to-transparent`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-3xl mb-2 block">{DESTINATIONS[0].flag}</span>
              <h3 className="text-4xl font-extrabold text-white tracking-tight mb-1">{DESTINATIONS[0].name}</h3>
              <p className="text-white/70 font-medium mb-3">{DESTINATIONS[0].tagline}</p>
              <div className="flex items-center gap-3">
                <span className="glass-dark text-white text-xs font-bold px-3 py-1.5 rounded-full">{DESTINATIONS[0].hotels}</span>
                <span className="glass-dark text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">arrow_forward</span> Explore
                </span>
              </div>
            </div>
          </div>

          {/* Small cards */}
          {DESTINATIONS.slice(1).map((dest, i) => (
            <div
              key={dest.name}
              className={`relative rounded-3xl overflow-hidden cursor-pointer group img-zoom ${destVisible ? `animate-fade-up delay-${(i + 2) * 100}` : "opacity-0"}`}
              onClick={() => quickFill(dest.name)}>
              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${dest.color} to-transparent`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-xl mb-1 block">{dest.flag}</span>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">{dest.name}</h3>
                <p className="text-white/60 text-sm font-medium">{dest.hotels}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPERIENCE STRIP ── */}
      <section className="bg-slate-900 py-20 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(19,127,236,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(167,139,250,0.1),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">The allStay experience</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Every detail crafted<br />
                <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  for your comfort
                </span>
              </h2>
              <p className="text-white/50 font-medium leading-relaxed mb-8 max-w-md">
                From the moment you arrive, you'll feel the difference. Our team anticipates your every need, so you can focus on what matters — enjoying your stay.
              </p>
              <Link to="/hotels"
                className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30">
                Explore our rooms
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "room_service", title: "In-Room Dining", desc: "24-hour gourmet room service crafted by Michelin-star chefs" },
                { icon: "pool", title: "Infinity Pool", desc: "Panoramic ocean views from our rooftop heated pool" },
                { icon: "spa", title: "Luxury Spa", desc: "Full-service spa with holistic treatments and therapies" },
                { icon: "fitness_center", title: "Premium Gym", desc: "State-of-the-art equipment with personal trainers on demand" },
              ].map(({ icon, title, desc }, i) => (
                <div key={title} className={`bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors ${i === 0 || i === 3 ? "mt-4" : ""}`}>
                  <span className="material-symbols-outlined text-primary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <h4 className="font-bold text-white text-sm mb-1.5">{title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section ref={reviewsRef} className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #2563eb, transparent)", filter: "blur(80px)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className={`text-center mb-16 ${reviewsVisible ? "animate-fade-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-amber-400 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-white/80 text-xs font-bold">4.9 · 2,400+ verified reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              What guests are saying
            </h2>
            <p className="text-white/50 font-medium text-base max-w-md mx-auto">
              Thousands of travellers have made unforgettable memories. Here are a few of their stories.
            </p>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map(({ name, location, rating, text, avatar, stay }, i) => (
              <div key={name}
                className={`relative group rounded-3xl p-8 border border-white/10 hover:border-white/25 transition-all duration-500 ${reviewsVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{
                  animationDelay: `${i * 120}ms`,
                  background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                  backdropFilter: "blur(12px)",
                }}>

                {/* Giant quote mark */}
                <div className="absolute top-5 right-6 text-7xl font-serif text-white/8 leading-none select-none pointer-events-none">&ldquo;</div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(rating)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-white/80 text-[15px] leading-relaxed mb-8 font-medium">&ldquo;{text}&rdquo;</p>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-6" />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-extrabold text-sm text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, hsl(${(i * 80 + 220) % 360},70%,55%), hsl(${(i * 80 + 260) % 360},80%,45%))` }}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{name}</p>
                    <p className="text-white/45 text-[11px] font-medium truncate">{location}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      <span className="material-symbols-outlined text-emerald-400 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <span className="text-emerald-400 text-[10px] font-bold">Verified</span>
                    </div>
                    <p className="text-white/35 text-[10px]">{stay}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust bar */}
          <div className={`mt-14 flex flex-wrap items-center justify-center gap-8 ${reviewsVisible ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "360ms" }}>
            {[
              { icon: "shield_check", label: "Verified reviews only" },
              { icon: "public", label: "Guests from 80+ countries" },
              { icon: "hotel", label: "500+ properties worldwide" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/50">
                <span className="material-symbols-outlined text-white/30 text-lg">{icon}</span>
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={room2} alt="Luxury room" className="w-full h-full object-cover" style={{ filter: "brightness(.3)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-violet-600/30" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Ready to travel?</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            Book your dream stay today
          </h2>
          <p className="text-white/65 font-medium mb-10 leading-relaxed">
            Join over 50,000 guests who've discovered the allStay difference. Your extraordinary experience awaits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/hotels"
              className="bg-white text-primary px-8 py-4 rounded-xl font-extrabold hover:bg-white/95 active:scale-95 transition-all shadow-2xl">
              Browse rooms
            </Link>
            {!isAuthenticated && (
              <Link to="/register"
                className="glass text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 active:scale-95 transition-all">
                Create free account
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <AIHelper />
    </div>
  );
}
