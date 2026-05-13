import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import room1 from "../../assets/images/room1.png";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function getHotelImg(hotel) {
  const img = hotel?.images?.find((i) => i.is_primary) ?? hotel?.images?.[0];
  return img?.image_url || room1;
}

function StarRating({ rating, interactive, value, onChange }) {
  const n = Number(rating) || 0;
  if (interactive) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => onChange(value === i ? 0 : i)}
            className={`material-symbols-outlined text-xl transition-colors ${i <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-300"}`}
            style={{ fontVariationSettings: i <= value ? "'FILL' 1" : "'FILL' 0" }}>star</button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined text-xs ${i <= Math.round(n) ? "text-amber-400" : "text-slate-200"}`}
          style={{ fontVariationSettings: i <= Math.round(n) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
      {n > 0 && <span className="text-[10px] font-bold text-slate-500 ml-1">{n.toFixed(1)}</span>}
    </div>
  );
}

/* ── component ───────────────────────────────────────────────────────────── */
export default function Hotels() {
  const navigate = useNavigate();

  const [hotels, setHotels]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // filters
  const [search, setSearch]             = useState("");
  const [cities, setCities]             = useState([]);      // selected city strings
  const [countries, setCountries]       = useState([]);      // selected country strings
  const [minRating, setMinRating]       = useState(0);       // star filter
  const [sortBy, setSortBy]             = useState("rating");
  const [view, setView]                 = useState("grid");
  const [expandCity, setExpandCity]     = useState(true);
  const [expandCountry, setExpandCountry] = useState(true);
  const [expandRating, setExpandRating] = useState(true);

  useEffect(() => {
    api.get("/public/search/hotels/browse?per_page=100")
      .then((res) => setHotels(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* derived filter options */
  const allCities    = useMemo(() => [...new Set(hotels.map((h) => h.city).filter(Boolean))].sort(), [hotels]);
  const allCountries = useMemo(() => [...new Set(hotels.map((h) => h.country).filter(Boolean))].sort(), [hotels]);

  /* apply filters */
  const filtered = useMemo(() => {
    let list = hotels;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) =>
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.country?.toLowerCase().includes(q) ||
        h.description?.toLowerCase().includes(q),
      );
    }
    if (cities.length)    list = list.filter((h) => cities.includes(h.city));
    if (countries.length) list = list.filter((h) => countries.includes(h.country));
    if (minRating > 0)    list = list.filter((h) => Number(h.rating) >= minRating);

    if (sortBy === "rating")   return [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
    if (sortBy === "name-asc") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name-desc")return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [hotels, search, cities, countries, minRating, sortBy]);

  /* active filter chips */
  const activeFilters = [
    ...cities.map((c) => ({ label: c, clear: () => setCities((p) => p.filter((x) => x !== c)) })),
    ...countries.map((c) => ({ label: c, clear: () => setCountries((p) => p.filter((x) => x !== c)) })),
    ...(minRating > 0 ? [{ label: `${minRating}★ & up`, clear: () => setMinRating(0) }] : []),
    ...(search.trim() ? [{ label: `"${search}"`, clear: () => setSearch("") }] : []),
  ];

  function clearAll() {
    setSearch(""); setCities([]); setCountries([]); setMinRating(0);
  }

  function toggleCity(city) {
    setCities((p) => p.includes(city) ? p.filter((x) => x !== city) : [...p, city]);
  }
  function toggleCountry(country) {
    setCountries((p) => p.includes(country) ? p.filter((x) => x !== country) : [...p, country]);
  }

  /* ── sidebar JSX (reused in desktop + mobile drawer) ── */
  const Sidebar = (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-slate-900">Filters</h2>
        {activeFilters.length > 0 && (
          <button onClick={clearAll} className="text-xs font-bold text-primary hover:underline">Clear all</button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hotels, cities…"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary/60"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* ── City ── */}
      {allCities.length > 0 && (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <button type="button" onClick={() => setExpandCity((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-bold text-slate-800">City</span>
            <span className="material-symbols-outlined text-sm text-slate-500">{expandCity ? "expand_less" : "expand_more"}</span>
          </button>
          {expandCity && (
            <div className="px-4 py-3 space-y-2 max-h-52 overflow-y-auto">
              {allCities.map((city) => (
                <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
                  <div onClick={() => toggleCity(city)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      cities.includes(city) ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"
                    }`}>
                    {cities.includes(city) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{city}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {hotels.filter((h) => h.city === city).length}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Country ── */}
      {allCountries.length > 0 && (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <button type="button" onClick={() => setExpandCountry((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-bold text-slate-800">Country</span>
            <span className="material-symbols-outlined text-sm text-slate-500">{expandCountry ? "expand_less" : "expand_more"}</span>
          </button>
          {expandCountry && (
            <div className="px-4 py-3 space-y-2 max-h-44 overflow-y-auto">
              {allCountries.map((country) => (
                <label key={country} className="flex items-center gap-2.5 cursor-pointer group">
                  <div onClick={() => toggleCountry(country)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      countries.includes(country) ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"
                    }`}>
                    {countries.includes(country) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{country}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {hotels.filter((h) => h.country === country).length}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Star Rating ── */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <button type="button" onClick={() => setExpandRating((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm font-bold text-slate-800">Star Rating</span>
          <span className="material-symbols-outlined text-sm text-slate-500">{expandRating ? "expand_less" : "expand_more"}</span>
        </button>
        {expandRating && (
          <div className="px-4 py-3 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <label key={star} className="flex items-center gap-2.5 cursor-pointer group">
                <div onClick={() => setMinRating(minRating === star ? 0 : star)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    minRating === star ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"
                  }`}>
                  {minRating === star && <span className="w-2 h-2 rounded-full bg-white block" />}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`material-symbols-outlined text-xs ${i <= star ? "text-amber-400" : "text-slate-200"}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="text-xs text-slate-500 ml-1 font-semibold">& up</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                  {hotels.filter((h) => Number(h.rating) >= star).length}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Sort (sidebar version, mobile only) ── */}
      <div className="border border-slate-100 rounded-xl overflow-hidden md:hidden">
        <div className="px-4 py-3 bg-slate-50">
          <span className="text-sm font-bold text-slate-800">Sort by</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            { val: "rating",    label: "Top rated" },
            { val: "name-asc",  label: "Name A → Z" },
            { val: "name-desc", label: "Name Z → A" },
          ].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => setSortBy(val)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  sortBy === val ? "bg-primary border-primary" : "border-slate-300"
                }`}>
                {sortBy === val && <span className="w-2 h-2 rounded-full bg-white block" />}
              </div>
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── hotel card ─────────────────────────────────────────────────────────── */
  function HotelCard({ hotel, listView }) {
    const img = getHotelImg(hotel);
    if (listView) {
      return (
        <div className="flex bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-300 group animate-fade-up">
          <div className="w-52 md:w-72 shrink-0 relative overflow-hidden">
            <img src={img} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = room1; }} />
            {Number(hotel.rating) >= 4.5 && (
              <span className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">Top Rated</span>
            )}
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors truncate">{hotel.name}</h3>
                  {(hotel.city || hotel.country) && (
                    <p className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {Number(hotel.rating) > 0 && <div className="mt-2"><StarRating rating={hotel.rating} /></div>}
                </div>
              </div>
              {hotel.description && (
                <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">{hotel.description}</p>
              )}
              {hotel.email && (
                <p className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                  <span className="material-symbols-outlined text-xs">mail</span>{hotel.email}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex gap-2 flex-wrap">
                {hotel.city && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{hotel.city}</span>}
                {Number(hotel.rating) > 0 && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{Number(hotel.rating).toFixed(1)} ★</span>}
              </div>
              <button onClick={() => navigate(`/rooms?hotel_id=${hotel.id}`)}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shrink-0">
                <span className="material-symbols-outlined text-xs">bed</span>
                View Rooms
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-900/8 overflow-hidden transition-all duration-300 group animate-fade-up">
        <div className="aspect-[4/3] relative overflow-hidden">
          <img src={img} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = room1; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {Number(hotel.rating) >= 4.5 && (
            <span className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-white px-2.5 py-1 rounded-full shadow-sm">Top Rated</span>
          )}
          {(hotel.city || hotel.country) && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-white text-xs">location_on</span>
              <span className="text-white text-xs font-semibold drop-shadow">
                {[hotel.city, hotel.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          {Number(hotel.rating) > 0 && <StarRating rating={hotel.rating} />}
          <h3 className="font-extrabold text-slate-900 mt-1.5 mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-1">
            {hotel.name}
          </h3>
          {hotel.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{hotel.description}</p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex gap-1.5 flex-wrap">
              {hotel.city && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{hotel.city}</span>}
            </div>
            <button onClick={() => navigate(`/rooms?hotel_id=${hotel.id}`)}
              className="flex items-center gap-1 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 group-hover:shadow-md group-hover:shadow-primary/25 transition-all">
              <span className="material-symbols-outlined text-xs">bed</span>
              View Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── skeleton ─────────────────────────────────────────────────────────── */
  const Skeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="h-8 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-[88px] pb-20">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hotels</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} hotel${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Mobile filter button */}
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-base">tune</span>
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map(({ label, clear }, i) => (
              <span key={i} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                {label}
                <button onClick={clear} className="ml-0.5 hover:opacity-70">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden md:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-[88px] bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              {Sidebar}
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-sm font-bold text-slate-700">
                {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-3">
                {/* Sort — desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Sort:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/60 bg-white cursor-pointer">
                    <option value="rating">Top Rated</option>
                    <option value="name-asc">Name A → Z</option>
                    <option value="name-desc">Name Z → A</option>
                  </select>
                </div>
                {/* View toggle */}
                <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5">
                  <button onClick={() => setView("grid")}
                    className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                  <button onClick={() => setView("list")}
                    className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
                    <span className="material-symbols-outlined text-sm">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? <Skeleton /> : filtered.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
                <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">search_off</span>
                <p className="font-extrabold text-slate-700 text-lg mb-1">No hotels found</p>
                <p className="text-sm text-slate-400 mb-6">Try adjusting your filters or search term.</p>
                <button onClick={clearAll}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                  <span className="material-symbols-outlined text-sm">refresh</span>Clear filters
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((hotel, i) => (
                  <div key={hotel.id} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                    <HotelCard hotel={hotel} listView={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((hotel, i) => (
                  <div key={hotel.id} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                    <HotelCard hotel={hotel} listView={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white shadow-2xl overflow-y-auto p-5 animate-slide-down">
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-extrabold text-slate-900">Filters</span>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {Sidebar}
            <button onClick={() => setMobileOpen(false)}
              className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
              Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
