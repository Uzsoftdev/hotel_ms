import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import api from "../../services/api";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating_desc",  label: "Top Rated" },
  { value: "name_asc",     label: "Name A–Z" },
];

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? "#f59e0b" : "none"}
          stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-xs font-bold text-slate-700 ml-1">{r.toFixed(1)}</span>
    </div>
  );
}

function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col sm:flex-row animate-pulse">
      <div className="sm:w-60 h-48 sm:h-auto bg-slate-200 shrink-0" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-10 bg-slate-200 rounded w-1/4 mt-4" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initLocation = searchParams.get("location") || "";
  const initCheckIn  = searchParams.get("checkIn")  || "";
  const initCheckOut = searchParams.get("checkOut") || "";
  const initAdults   = Number(searchParams.get("adults"))   || 2;
  const initChildren = Number(searchParams.get("children")) || 0;
  const initRooms    = Number(searchParams.get("rooms"))    || 1;

  const [sb, setSb] = useState({
    location: initLocation, checkIn: initCheckIn, checkOut: initCheckOut,
    adults: initAdults, children: initChildren, rooms: initRooms,
  });

  const [hotels,   setHotels]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);

  // Filter / sort state (client-side on fetched data)
  const [minRating, setMinRating] = useState(0);
  const [sort,      setSort]      = useState("recommended");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isSaved, toggle: wishlistToggle } = useWishlist();

  const fetchHotels = useCallback(async (location, pg = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (location.trim()) {
        // Search by destination
        res = await api.get("/public/search/hotels", {
          params: { q: location, per_page: 20, page: pg },
        });
      } else {
        // No destination — browse all hotels (top rated first)
        res = await api.get("/public/search/hotels/browse", {
          params: { per_page: 20, page: pg },
        });
      }
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setHotels(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === 20);
      setPage(pg);
    } catch (err) {
      setError("Failed to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + refetch when URL params change
  useEffect(() => {
    fetchHotels(initLocation, 1, false);
  }, [initLocation, fetchHotels]);

  function handleSearch(e) {
    e.preventDefault();
    setSearchParams({
      location: sb.location,
      checkIn:  sb.checkIn,
      checkOut: sb.checkOut,
      adults:   sb.adults,
      children: sb.children,
      rooms:    sb.rooms,
    });
  }

  function handleBook(hotel) {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/search?${searchParams.toString()}` } });
      return;
    }
    navigate(`/booking?hotel_id=${hotel.id}&check_in=${initCheckIn}&check_out=${initCheckOut}&adults=${initAdults}&children=${initChildren}&rooms=${initRooms}`);
  }

  // Client-side sort (data already fetched from API)
  const displayed = [...hotels]
    .filter(h => (parseFloat(h.rating) || 0) >= minRating)
    .sort((a, b) => {
      if (sort === "rating_desc") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      if (sort === "name_asc")   return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      <Navbar />

      {/* Sticky search bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-36">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                <input value={sb.location} onChange={e => setSb({...sb, location: e.target.value})}
                  placeholder="Where to?"
                  className="text-sm font-semibold bg-transparent outline-none text-slate-900 placeholder:text-slate-400 flex-1 min-w-0" />
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-48">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-in</label>
              <input type="date" value={sb.checkIn} min={new Date().toISOString().split("T")[0]}
                onChange={e => setSb({...sb, checkIn: e.target.value})}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-colors bg-white" />
            </div>
            <div className="flex flex-col gap-1 min-w-48">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-out</label>
              <input type="date" value={sb.checkOut} min={sb.checkIn || new Date().toISOString().split("T")[0]}
                onChange={e => setSb({...sb, checkOut: e.target.value})}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-colors bg-white" />
            </div>
            <button type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><line x1="17" y1="17" x2="22" y2="22"/>
              </svg>
              Search
            </button>
          </form>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className={`w-64 shrink-0 ${sidebarOpen ? "block" : "hidden"} md:block`}>
            <div className="sticky top-28 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Filters</h3>
              </div>
              <div className="px-5 py-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Guest rating</h4>
                <div className="space-y-2.5">
                  {[{label: "Exceptional 4.5+", value: 4.5}, {label: "Very good 4.0+", value: 4.0}, {label: "Good 3.5+", value: 3.5}, {label: "Any", value: 0}].map(({label, value}) => (
                    <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="rating" checked={minRating === value}
                        onChange={() => setMinRating(value)} className="accent-blue-600 cursor-pointer" />
                      <span className={`text-sm font-medium ${minRating === value ? "text-blue-600 font-semibold" : "text-slate-600 group-hover:text-slate-900"}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  {initLocation ? `Hotels in ${initLocation}` : "Top-Rated Hotels"}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {loading ? "Searching…" : `${displayed.length} hotel${displayed.length !== 1 ? "s" : ""} found`}
                  {initCheckIn && initCheckOut ? ` · ${initCheckIn} → ${initCheckOut}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden border border-slate-200 bg-white px-3 py-2 rounded-xl text-sm font-bold text-slate-700">
                  Filters
                </button>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* No longer shows 'start your search' - browse all if no destination */}


            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-semibold">{error}</p>
                <button onClick={() => fetchHotels(initLocation)} className="mt-3 text-sm text-red-500 hover:underline">Try again</button>
              </div>
            )}

            {/* Skeleton loaders */}
            {loading && hotels.length === 0 && (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <HotelCardSkeleton key={i} />)}
              </div>
            )}

            {/* No results */}
            {!loading && !error && initLocation && displayed.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 py-24 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" className="mx-auto mb-4">
                  <circle cx="11" cy="11" r="7"/><line x1="17" y1="17" x2="22" y2="22"/>
                  <line x1="8" y1="8" x2="14" y2="14" stroke="#fca5a5"/>
                </svg>
                <p className="font-bold text-slate-500 mb-2">No hotels found for "{initLocation}"</p>
                <p className="text-sm text-slate-400">Try a different city or country name</p>
              </div>
            )}

            {/* Hotel cards */}
            {displayed.length > 0 && (
              <div className="space-y-4">
                {displayed.map((hotel, i) => (
                  <article key={hotel.id}
                    className="bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>

                    {/* Image */}
                    <div className="sm:w-64 h-52 sm:h-auto relative overflow-hidden shrink-0 bg-slate-100">
                      {(() => {
                        const primaryImg = hotel.images?.find(img => img.is_primary) || hotel.images?.[0];
                        return primaryImg ? (
                          <img src={primaryImg.image_url} alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.style.display='none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
                              <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
                            </svg>
                          </div>
                        );
                      })()}
                      <button type="button" onClick={() => wishlistToggle(hotel.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform">
                        <svg width="14" height="14" viewBox="0 0 24 24"
                          fill={isSaved(hotel.id) ? "#f43f5e" : "none"}
                          stroke={isSaved(hotel.id) ? "#f43f5e" : "#94a3b8"} strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h2 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">
                              {hotel.name}
                            </h2>
                            <StarRating rating={hotel.rating} />
                            <p className="text-xs text-slate-400 font-medium mt-1">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                              </svg>
                              {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </div>
                        {hotel.description && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{hotel.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" stroke="none">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span className="text-xs font-semibold">Free cancellation</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleBook(hotel)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200">
                            See rooms
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button onClick={() => fetchHotels(initLocation, page + 1, true)}
                      disabled={loading}
                      className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50">
                      {loading ? "Loading…" : "Load more hotels"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
