import { useState } from "react";
import { Link } from "react-router-dom";
import parisImage from "../../assets/images/paris_result.png";
import baliImage from "../../assets/images/bali_search.png";
import newyorkImage from "../../assets/images/new_york_search.png";

const SORT_OPTIONS = ["Recommended", "Price: Low to High", "Price: High to Low", "Rating"];

const AMENITIES = ["Free WiFi", "Pool", "Spa", "Parking", "Restaurant"];

const results = [
  {
    id: 1,
    name: "The Celestial Terrace Suite",
    location: "7th Arrondissement, Paris",
    rating: "5.0",
    badge: "Rare Find",
    tags: ["Eiffel View", "Private Balcony", "Butler Service"],
    price: 850,
    image: parisImage,
  },
  {
    id: 2,
    name: "Azure Horizon Sanctuary",
    location: "Ubud, Bali",
    rating: "4.9",
    badge: "Premier",
    tags: ["Infinity Pool", "Eco-Luxury", "Full Spa"],
    price: 1200,
    image: baliImage,
  },
  {
    id: 3,
    name: "The Skyline Penthouse",
    location: "Upper West Side, NY",
    rating: "4.8",
    badge: "Modernist",
    tags: ["City Skyline", "Chef's Kitchen", "Concierge"],
    price: 1450,
    image: newyorkImage,
  },
  {
    id: 4,
    name: "Grand Palais Residence",
    location: "1st Arrondissement, Paris",
    rating: "4.9",
    badge: "Historic",
    tags: ["Garden View", "Michelin Dining", "Spa"],
    price: 980,
    image: parisImage,
  },
  {
    id: 5,
    name: "Jungle Cliff Villa",
    location: "Seminyak, Bali",
    rating: "4.7",
    badge: "Boutique",
    tags: ["Cliff View", "Private Pool", "Yoga Studio"],
    price: 760,
    image: baliImage,
  },
  {
    id: 6,
    name: "Manhattan Loft Suite",
    location: "Midtown, New York",
    rating: "4.8",
    badge: "Urban Luxury",
    tags: ["City View", "Rooftop Access", "Gym"],
    price: 1100,
    image: newyorkImage,
  },
];

export default function SearchResults() {
  const [sort, setSort] = useState("Recommended");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState([]);

  const toggleFav = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const sorted = [...results].sort((a, b) => {
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    if (sort === "Rating") return parseFloat(b.rating) - parseFloat(a.rating);
    return 0;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Azure Horizon</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">Register</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* Filter Bar */}
      <div className="w-full bg-surface-container-lowest/90 backdrop-blur-sm border-b border-outline-variant/50 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 divide-x divide-outline-variant">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Location</span>
              <span className="text-sm font-bold text-on-surface">Paris, France</span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Dates</span>
              <span className="text-sm font-bold text-on-surface">Oct 12 – Oct 18</span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Guests</span>
              <span className="text-sm font-bold text-on-surface">2 Adults, 1 Room</span>
            </div>
          </div>
          <Link to="/" className="bg-surface-container-highest text-on-surface px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-outline-variant transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">tune</span>
            Modify Search
          </Link>
        </div>
      </div>

      {/* Main */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex flex-col md:flex-row gap-10">

          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">Price Range</h3>
              <input className="w-full accent-primary cursor-pointer" max="2500" min="200" step="50" type="range" />
              <div className="flex justify-between mt-2">
                <span className="text-xs font-bold text-on-surface">$200</span>
                <span className="text-xs font-bold text-on-surface">$2,500+</span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="pt-6 border-t border-outline-variant/50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">Star Rating</h3>
              <div className="space-y-3">
                {["5 Stars Luxury", "4 Stars Premium", "3 Stars Standard"].map((label) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant accent-primary" type="checkbox" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="pt-6 border-t border-outline-variant/50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">Amenities</h3>
              <div className="space-y-3">
                {AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant accent-primary" type="checkbox" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Room Type */}
            <div className="pt-6 border-t border-outline-variant/50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">Room Type</h3>
              <div className="space-y-3">
                {["Presidential Suite", "Executive King", "Deluxe Double"].map((t) => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 border-outline-variant accent-primary" name="room_type" type="radio" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 space-y-6">

            {/* Sort Bar */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Luxury Stays in Paris</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{sorted.length} premium results found</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">sort</span>
                <select
                  className="bg-transparent border-none text-sm font-bold text-on-surface focus:ring-0 cursor-pointer outline-none"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Cards */}
            {sorted.map((room) => (
              <article key={room.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg border border-outline-variant/30 flex flex-col md:flex-row hover:shadow-2xl transition-all group">
                <div className="w-full md:w-72 h-56 md:h-auto relative overflow-hidden shrink-0">
                  <img alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={room.image} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">{room.rating} {room.badge}</span>
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-extrabold text-on-surface">{room.name}</h2>
                      <button
                        type="button"
                        onClick={() => toggleFav(room.id)}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="Toggle favorite"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: favorites.includes(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{room.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Starting from</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-on-surface">${room.price.toLocaleString()}</span>
                        <span className="text-sm font-medium text-on-surface-variant">/ night</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to="/rooms" className="px-5 py-2.5 rounded-lg border border-primary text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/5 transition-colors">
                        Details
                      </Link>
                      <Link to="/booking" className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Pagination */}
            <nav className="flex items-center justify-center gap-2 pt-8" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${page === n ? "bg-primary text-white shadow-md" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-2 text-on-surface-variant">...</span>
              <button type="button" onClick={() => setPage(12)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-bold transition-colors">12</button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
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
