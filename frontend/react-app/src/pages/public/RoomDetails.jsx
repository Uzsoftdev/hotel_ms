import { Link } from "react-router-dom";
import parisImage from "../../assets/images/paris_1.png";

const highlights = [
  { icon: "straighten", label: "Size", value: "1,290 sq ft" },
  { icon: "king_bed", label: "Bedding", value: "1 King Bed" },
  { icon: "groups", label: "Capacity", value: "3 Guests" },
  { icon: "balcony", label: "Outdoor", value: "Private Terrace" },
];

const amenities = [
  "Personal Butler Service 24/7",
  "Complimentary Airport Transfer",
  "Nespresso Vertuo Coffee Station",
  "In-room Smart Control Tablet",
  "Hermès Bath & Body Products",
  "Bose Surround Sound System",
  "Rainfall Walk-in Shower & Spa Tub",
  "High-Speed Wi-Fi 6E",
];

const reviews = [
  {
    initials: "AS",
    name: "Alexandra Sterling",
    date: "October 2023",
    text: "An unforgettable stay. The view from the terrace at sunset is something I will cherish forever. The butler service was exceptionally discreet yet attentive.",
  },
  {
    initials: "JV",
    name: "James von Trapp",
    date: "September 2023",
    text: "The attention to detail in the room's design is phenomenal. Every piece of furniture feels intentional. Truly a world-class experience in the heart of Paris.",
  },
];

export default function RoomDetails() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Azure Horizon</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-sm font-semibold text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">Register</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img
          alt="The Celestial Terrace Suite with panoramic Paris skyline views"
          className="w-full h-full object-cover scale-105"
          src={parisImage}
        />
        <div className="absolute bottom-0 left-0 w-full px-8 md:px-12 pb-10 z-20 flex justify-between items-end">
          <div className="space-y-3">
            <span className="bg-primary/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Presidential Suite
            </span>
            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
              The Celestial Terrace Suite
            </h1>
          </div>
          <Link
            to="/booking"
            className="hidden md:flex bg-primary text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-2xl shadow-primary/30"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-10">
          <Link className="hover:text-primary transition-colors" to="/rooms">Rooms</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface">The Celestial Terrace Suite</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-14">

            {/* Rating & Description */}
            <div className="space-y-5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-on-surface">4.9 / 5.0</span>
                <span className="text-outline-variant">|</span>
                <span className="text-sm font-medium text-on-surface-variant">128 Verified Reviews</span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-xs font-bold uppercase tracking-widest">7th Arrondissement, Paris</span>
                </div>
              </div>
              <p className="text-base leading-relaxed text-on-surface-variant font-medium">
                Experience the pinnacle of Parisian luxury in our Celestial Terrace Suite. Perched on the highest floor of Azure Horizon, this expansive 1,290 sq ft sanctuary offers an unparalleled 270-degree view of the city's iconic landmarks. Hand-curated modernist furniture meets classical architectural details, creating an atmosphere of timeless sophistication and modern comfort.
              </p>
            </div>

            {/* Room Highlights */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Room Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {highlights.map((h) => (
                  <div key={h.label} className="p-6 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-3">
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
                {amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span className="text-sm font-medium text-on-surface-variant">{a}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Guest Reviews</h2>
                <button type="button" className="text-primary font-bold text-sm hover:underline">View All Reviews</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <div key={r.name} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-lg space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-primary">{r.initials}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{r.name}</p>
                        <p className="text-xs text-on-surface-variant font-medium">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm italic text-on-surface-variant leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 p-6 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-on-surface">$2,450</span>
                  <span className="text-on-surface-variant font-medium text-sm">/ night</span>
                </div>
              </div>

              {/* Date inputs */}
              <div className="grid grid-cols-2 border border-outline-variant rounded-lg overflow-hidden">
                <div className="p-4 border-r border-outline-variant">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Check In</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-on-surface outline-none" type="date" />
                </div>
                <div className="p-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Check Out</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-on-surface outline-none" type="date" />
                </div>
              </div>

              <div className="p-4 border border-outline-variant rounded-lg">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Guests</label>
                <select className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-on-surface outline-none cursor-pointer">
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option selected>2 Adults, 1 Child</option>
                  <option>2 Adults, 2 Children</option>
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/30">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">$2,450 × 5 nights</span>
                  <span className="font-bold text-on-surface">$12,250</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">Service Fee</span>
                  <span className="font-bold text-on-surface">$420</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">Luxury Tax (12%)</span>
                  <span className="font-bold text-on-surface">$1,520</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-outline-variant/30 items-baseline">
                  <span className="font-extrabold text-on-surface">Total</span>
                  <span className="text-2xl font-extrabold text-primary">$14,190</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/booking"
                  className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Book Now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <button
                  type="button"
                  className="w-full border border-primary text-primary py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  Add to Wishlist
                </button>
              </div>

              <p className="text-center text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs align-middle mr-1">lock</span>
                Secure encrypted booking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 mt-10 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">Azure Horizon</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            © 2024 Azure Horizon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
