import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ROOMS } from "../../data/rooms";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const today = new Date().toISOString().split("T")[0];

const CATEGORIES = ["Standard", "Economy", "Deluxe", "Suite", "Presidential"];
const ALL_AMENITIES = ["WiFi", "Pool", "Spa", "Parking", "Breakfast", "Bathtub", "Balcony", "A/C", "TV"];
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating_desc", label: "Top Rated" },
  { value: "name_asc", label: "Name A–Z" },
];

const TAG_COLORS = {
  "Free Breakfast": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Free Cancellation": "bg-teal-50 text-teal-700 border-teal-100",
  "Free Parking": "bg-sky-50 text-sky-700 border-sky-100",
  "Best Value": "bg-amber-50 text-amber-700 border-amber-100",
  "Butler Service": "bg-purple-50 text-purple-700 border-purple-100",
  "Ocean View": "bg-cyan-50 text-cyan-700 border-cyan-100",
  "City View": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Panoramic View": "bg-blue-50 text-blue-700 border-blue-100",
  "Beachfront": "bg-green-50 text-green-700 border-green-100",
  "Private Terrace": "bg-violet-50 text-violet-700 border-violet-100",
};

function StarRating({ rating, showNum = true }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined text-xs ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
      {showNum && <span className="text-xs font-bold text-slate-700 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}

export default function SearchResults() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initLocation = searchParams.get("location") || "";
  const initCheckIn = searchParams.get("checkIn") || "";
  const initCheckOut = searchParams.get("checkOut") || "";
  const initGuests = Number(searchParams.get("guests")) || 1;

  const [sb, setSb] = useState({ location: initLocation, checkIn: initCheckIn, checkOut: initCheckOut, guests: initGuests });
  const [priceRange, setPriceRange] = useState(1500);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("recommended");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [view, setView] = useState("list");
  const { isSaved, toggle: wishlistToggle } = useWishlist();

  const hasFilters = selectedCats.length > 0 || selectedAmenities.length > 0 || minRating > 0 || priceRange < 1500;

  function toggleCat(cat) { setSelectedCats((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]); }
  function toggleAmenity(a) { setSelectedAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]); }
  function toggleWishlist(room) { if (!isAuthenticated) { setAuthModal(room); return; } wishlistToggle(room.id); }
  function clearFilters() { setSelectedCats([]); setSelectedAmenities([]); setMinRating(0); setPriceRange(1500); }

  function handleSearch(e) {
    e.preventDefault();
    setSearchParams({ location: sb.location, checkIn: sb.checkIn, checkOut: sb.checkOut, guests: sb.guests });
  }

  function handleBook(room) {
    if (!isAuthenticated) { setAuthModal(room); return; }
    navigate(`/booking?room_id=${room.id}&price=${room.price_per_night}&room_name=${encodeURIComponent(room.name)}&check_in=${initCheckIn}&check_out=${initCheckOut}`, { state: { room } });
  }

  const filtered = useMemo(() => {
    let list = ROOMS.filter((r) => {
      if (r.price_per_night > priceRange) return false;
      if (selectedCats.length > 0 && !selectedCats.includes(r.category)) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => r.amenities.includes(a))) return false;
      if (r.rating < minRating) return false;
      if (initGuests > 0 && r.capacity < initGuests) return false;
      return true;
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price_per_night - b.price_per_night);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price_per_night - a.price_per_night);
    else if (sort === "rating_desc") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [priceRange, selectedCats, selectedAmenities, minRating, sort, initGuests]);

  const Sidebar = () => (
    <aside className="w-72 shrink-0">
      <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Filters</h3>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors">Clear all</button>
          )}
        </div>

        {/* Price */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Max price / night</h4>
            <span className="text-sm font-extrabold text-primary">${priceRange.toLocaleString()}</span>
          </div>
          <input type="range" min={80} max={1500} step={20} value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer" />
          <div className="flex justify-between mt-1 text-[10px] font-semibold text-slate-400">
            <span>$80</span><span>$1,500+</span>
          </div>
        </div>

        {/* Room type */}
        <div className="px-5 py-5 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Room type</h4>
          <div className="space-y-2.5">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <input type="checkbox" checked={selectedCats.includes(cat)} onChange={() => toggleCat(cat)} className="w-4 h-4 rounded accent-primary cursor-pointer" />
                  <span className={`text-sm font-medium transition-colors ${selectedCats.includes(cat) ? "text-primary font-semibold" : "text-slate-600 group-hover:text-slate-900"}`}>{cat}</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-full">{ROOMS.filter((r) => r.category === cat).length}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="px-5 py-5 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Guest rating</h4>
          <div className="space-y-2.5">
            {[{ label: "Exceptional 4.5+", value: 4.5 }, { label: "Very good 4.0+", value: 4.0 }, { label: "Good 3.5+", value: 3.5 }, { label: "Any", value: 0 }].map(({ label, value }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="radio" name="rating" checked={minRating === value} onChange={() => setMinRating(value)} className="accent-primary cursor-pointer" />
                <span className={`text-sm font-medium transition-colors ${minRating === value ? "text-primary font-semibold" : "text-slate-600 group-hover:text-slate-900"}`}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="px-5 py-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {ALL_AMENITIES.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  selectedAmenities.includes(a) ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                }`}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      <Navbar />

      {/* Refined search bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-36">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                <span className="material-symbols-outlined text-slate-400 text-sm">location_on</span>
                <input value={sb.location} onChange={(e) => setSb({ ...sb, location: e.target.value })} placeholder="Where to?"
                  className="text-sm font-semibold bg-transparent outline-none text-slate-900 placeholder:text-slate-400 flex-1 min-w-0" />
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-36">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-in</label>
              <input type="date" value={sb.checkIn} min={today} onChange={(e) => setSb({ ...sb, checkIn: e.target.value })}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white outline-none focus:border-primary transition-colors" />
            </div>
            <div className="flex flex-col gap-1 min-w-36">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-out</label>
              <input type="date" value={sb.checkOut} min={sb.checkIn || today} onChange={(e) => setSb({ ...sb, checkOut: e.target.value })}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white outline-none focus:border-primary transition-colors" />
            </div>
            <div className="flex flex-col gap-1 min-w-28">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guests</label>
              <select value={sb.guests} onChange={(e) => setSb({ ...sb, guests: Number(e.target.value) })}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white outline-none focus:border-primary transition-colors cursor-pointer">
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
              </select>
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-sm">search</span>Update
            </button>
          </form>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Mobile filter button */}
        <div className="flex items-center justify-between mb-5 md:hidden">
          <div>
            <h1 className="font-extrabold text-slate-900">{initLocation ? `Rooms in ${initLocation}` : "All Rooms"}</h1>
            <p className="text-sm text-slate-400">{filtered.length} found</p>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-sm">tune</span>
            Filters {hasFilters && <span className="bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{selectedCats.length + selectedAmenities.length}</span>}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop always, mobile toggle */}
          <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
            <Sidebar />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="hidden md:flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  {initLocation ? `Rooms in ${initLocation}` : "All Available Rooms"}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {filtered.length} room{filtered.length !== 1 ? "s" : ""} found
                  {initCheckIn && initCheckOut ? ` · ${initCheckIn} → ${initCheckOut}` : ""}
                  {initGuests > 0 ? ` · ${initGuests} guest${initGuests !== 1 ? "s" : ""}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white">
                  <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
                    <span className="material-symbols-outlined text-sm">view_list</span>
                  </button>
                  <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                </div>
                {/* Sort */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">sort</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="text-sm font-bold bg-transparent outline-none cursor-pointer text-slate-700">
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-24 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">search_off</span>
                <p className="font-bold text-slate-500 mb-2">No rooms match your filters</p>
                <button onClick={clearFilters} className="text-primary text-sm font-semibold hover:underline">Clear all filters</button>
              </div>
            ) : view === "list" ? (
              <div className="space-y-4">
                {filtered.map((room, i) => (
                  <article key={room.id}
                    className="bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group animate-fade-up"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
                    {/* Image */}
                    <div className="sm:w-60 h-52 sm:h-auto relative overflow-hidden shrink-0 img-zoom">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => toggleWishlist(room)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform">
                        <span className={`material-symbols-outlined text-sm ${isSaved(room.id) ? "text-rose-500" : "text-slate-300"}`}
                          style={{ fontVariationSettings: isSaved(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/95 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">{room.category}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h2 className="text-base font-extrabold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1">{room.name}</h2>
                            <StarRating rating={room.rating} />
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{room.reviews} reviews</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block">From</span>
                            <span className="text-2xl font-extrabold text-primary">${room.price_per_night}</span>
                            <span className="text-[10px] text-slate-400 block">/night</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{room.description}</p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.tags.map((tag) => (
                            <span key={tag} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${TAG_COLORS[tag] || "bg-slate-50 border-slate-200 text-slate-600"}`}>{tag}</span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-slate-400">
                          {room.amenities.map((a, idx) => (
                            <div key={a} className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">{room.amenityIcons[idx]}</span>
                              <span className="text-[10px] font-semibold">{a}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">group</span>
                            <span className="text-[10px] font-semibold">Up to {room.capacity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span className="text-xs font-semibold">Free cancellation</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/room-details/${room.id}`} state={{ room }}
                            className="border border-slate-200 text-slate-700 hover:border-primary hover:text-primary px-4 py-2 rounded-xl text-sm font-bold transition-all">Details</Link>
                          <button type="button" onClick={() => handleBook(room)}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20">Reserve</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((room, i) => (
                  <div key={room.id} className="bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-300 group card-hover animate-fade-up"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
                    <div className="aspect-[4/3] overflow-hidden relative img-zoom">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => toggleWishlist(room)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform">
                        <span className={`material-symbols-outlined text-sm ${isSaved(room.id) ? "text-rose-500" : "text-slate-300"}`}
                          style={{ fontVariationSettings: isSaved(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/95 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">{room.category}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-primary transition-colors leading-tight">{room.name}</h3>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-extrabold text-primary">${room.price_per_night}</span>
                          <span className="text-[10px] text-slate-400 block">/night</span>
                        </div>
                      </div>
                      <StarRating rating={room.rating} />
                      <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                        {room.tags.slice(0,2).map((tag) => (
                          <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[tag] || "bg-slate-50 border-slate-200 text-slate-600"}`}>{tag}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <Link to={`/room-details/${room.id}`} state={{ room }} className="flex-1 border border-slate-200 text-center text-slate-700 hover:border-primary hover:text-primary py-2 rounded-xl text-xs font-bold transition-all">Details</Link>
                        <button type="button" onClick={() => handleBook(room)} className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all">Reserve</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAuthModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
            <div className="h-36 overflow-hidden relative">
              <img src={authModal.image} alt={authModal.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setAuthModal(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-slate-600 text-sm">close</span>
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase">{authModal.category}</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">{authModal.name}</h3>
              <p className="text-sm text-slate-500 mb-5">Sign in to reserve this room and manage your bookings.</p>
              <div className="space-y-2.5">
                <Link to="/login" state={{ from: `/search?${searchParams.toString()}` }}
                  className="block w-full bg-primary text-white py-3 rounded-xl font-bold text-sm text-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Sign in to continue
                </Link>
                <Link to="/register" className="block w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm text-center hover:bg-slate-50 transition-all">
                  Create a free account
                </Link>
              </div>
              <button onClick={() => setAuthModal(null)} className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors">Continue browsing</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
