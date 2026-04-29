import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const AMENITIES_LIST = [
  "High-speed fibre Wi-Fi (1 Gbps)",
  "24-hour room service",
  "Nightly turndown service",
  "Complimentary minibar (restocked daily)",
  "Pillow menu & premium bedding",
  "Smart TV with streaming services",
  "In-room safe & laptop storage",
  "Marble en-suite bathroom",
  "Complimentary pressing & laundry",
  "Daily newspaper in preferred language",
];

const REVIEWS = [
  { initials: "AS", author: "Alexandra S.", date: "March 2026", comment: "Absolutely breathtaking views and impeccable service. The room was larger than I expected and the concierge team went above and beyond." },
  { initials: "JV", author: "James V.", date: "February 2026", comment: "Best hotel stay of my life. The bath amenities were top-tier and the bed was cloud-like. Will definitely return for our anniversary." },
  { initials: "ML", author: "Marie L.", date: "January 2026", comment: "Perfect in every detail — the check-in was seamless, the room immaculate, and the breakfast selection was extraordinary." },
  { initials: "RK", author: "Ravi K.", date: "December 2025", comment: "Luxury at its finest. The room exceeded all expectations and the staff made every moment feel special." },
];

const today = new Date().toISOString().split("T")[0];

export default function RoomDetails() {
  const { t } = useTranslation("pub_translation");
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle: wishlistToggle } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const room = location.state?.room;

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState("");
  const [widgetCheckIn, setWidgetCheckIn] = useState(location.state?.checkIn || "");
  const [widgetCheckOut, setWidgetCheckOut] = useState(location.state?.checkOut || "");
  const [widgetGuests, setWidgetGuests] = useState(location.state?.guests || 1);

  function requireAuth(action) {
    if (isAuthenticated) {
      if (action === "book") navigate("/booking", { state: { room, checkIn: widgetCheckIn, checkOut: widgetCheckOut, guests: widgetGuests } });
      if (action === "wishlist") wishlistToggle(room.id);
    } else {
      setPromptAction(action);
      setShowLoginPrompt(true);
    }
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 text-on-surface">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">hotel</span>
        <p className="text-lg font-semibold">Room not found.</p>
        <Link to="/rooms" className="text-primary font-bold hover:underline">Back to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="bg-white text-on-surface min-h-screen">
      <Navbar />
      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-bright rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <div>
                <p className="font-extrabold text-on-surface">Sign in required</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {promptAction === "book" ? "Create an account or sign in to book this room." : "Sign in to add rooms to your wishlist."}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 flex items-center gap-3">
              <img src={room.image} alt={room.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div>
                <p className="text-sm font-bold text-on-surface">{room.name}</p>
                <p className="text-xs text-on-surface-variant">${room.price_per_night} / night</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                state={{ from: location.pathname, room }}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm text-center hover:bg-primary/90 transition-all"
              >
                Sign in to continue
              </Link>
              <Link
                to="/register"
                className="w-full border border-outline-variant/40 text-on-surface py-3 rounded-lg font-bold text-sm text-center hover:bg-surface-container-low transition-all"
              >
                Create an account
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero image */}
      <section className="relative h-[480px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img alt={room.name} className="w-full h-full object-cover scale-105" src={room.image} />
        <div className="absolute bottom-0 left-0 w-full px-8 md:px-12 pb-10 z-20 flex justify-between items-end">
          <div className="space-y-3">
            <span className="bg-primary/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {room.category}
            </span>
            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">{room.name}</h1>
          </div>
          <button
            onClick={() => requireAuth("book")}
            className="hidden md:flex bg-primary text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-2xl shadow-primary/30"
          >
            {t("room_details.book_now")}
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-10">
          <Link className="hover:text-primary transition-colors" to="/rooms">Rooms</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface">{room.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: content */}
          <div className="lg:col-span-2 space-y-14">
            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-on-surface">4.9 / 5</span>
                <span className="text-outline-variant">|</span>
                <span className="text-sm font-medium text-on-surface-variant">128 verified reviews</span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Miami, Ocean Drive</span>
                </div>
              </div>
              <p className="text-base leading-relaxed text-on-surface-variant font-medium">{room.description}</p>
            </div>

            {/* Highlights */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Room Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "straighten", label: "Size", value: "65 m²" },
                  { icon: "king_bed", label: "Bedding", value: "King Bed" },
                  { icon: "groups", label: "Capacity", value: `${room.capacity || 2} Guests` },
                  { icon: "balcony", label: "View", value: "Ocean / City" },
                ].map((h) => (
                  <div key={h.label} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">{h.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{h.label}</p>
                      <p className="font-bold text-on-surface mt-0.5">{h.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Luxury Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                {AMENITIES_LIST.map((a) => (
                  <div key={a} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span className="text-sm font-medium text-on-surface-variant">{a}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Guest Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REVIEWS.map((r) => (
                  <div key={r.author} className="bg-surface-bright rounded-xl p-6 border border-outline-variant/30 shadow-lg space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-primary">{r.initials}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{r.author}</p>
                        <p className="text-xs text-on-surface-variant font-medium">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm italic text-on-surface-variant leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-surface-bright rounded-xl shadow-2xl border border-outline-variant/30 p-6 space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-on-surface">${room.price_per_night}</span>
                  <span className="text-on-surface-variant font-medium text-sm">/ night</span>
                </div>
              </div>

              <div className="grid grid-cols-2 border border-outline-variant/30 rounded-lg overflow-hidden">
                <div className="p-3 border-r border-outline-variant/30">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Check-in</label>
                  <input className="w-full bg-transparent text-sm font-bold text-on-surface outline-none" type="date" min={today} value={widgetCheckIn} onChange={(e) => { setWidgetCheckIn(e.target.value); if (widgetCheckOut && e.target.value >= widgetCheckOut) setWidgetCheckOut(""); }} />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Check-out</label>
                  <input className="w-full bg-transparent text-sm font-bold text-on-surface outline-none" type="date" min={widgetCheckIn || today} value={widgetCheckOut} onChange={(e) => setWidgetCheckOut(e.target.value)} />
                </div>
              </div>

              <div className="p-3 border border-outline-variant/30 rounded-lg">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Guests</label>
                <select className="w-full bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer" value={widgetGuests} onChange={(e) => setWidgetGuests(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
                </select>
              </div>

              {/* Login notice when not authenticated */}
              {!isAuthenticated && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                  <p className="text-xs font-semibold text-primary">
                    <Link to="/login" className="underline">Sign in</Link> or <Link to="/register" className="underline">register</Link> to complete your booking.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => requireAuth("book")}
                  className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isAuthenticated ? "Book Now" : "Sign in to Book"}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                  onClick={() => requireAuth("wishlist")}
                  type="button"
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isAuthenticated && isSaved(room.id)
                      ? "bg-rose-50 border border-rose-300 text-rose-500"
                      : "border border-primary text-primary hover:bg-primary/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isAuthenticated && isSaved(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                  {isAuthenticated ? (isSaved(room.id) ? "Saved" : "Save Room") : "Sign in to Save"}
                </button>
              </div>

              <p className="text-center text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs align-middle mr-1">lock</span>
                Secure & encrypted booking
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
