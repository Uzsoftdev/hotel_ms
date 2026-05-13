import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import api from "../../services/api";
import room1 from "../../assets/images/room1.png";
import room2 from "../../assets/images/room2.png";
import hotel3 from "../../assets/images/hotel3.png";
import bali from "../../assets/images/bali_1.png";

/* ── room helpers (was in Rooms.jsx) ─────────────────────────────────────── */
const FALLBACK_IMAGES = { Standard: room1, Economy: room2, Deluxe: bali, Suite: hotel3, Presidential: bali };
const AMENITY_DEFAULTS = {
  Standard:     { amenities: ["WiFi", "A/C", "TV"],            icons: ["wifi", "ac_unit", "tv"] },
  Economy:      { amenities: ["WiFi", "TV"],                   icons: ["wifi", "tv"] },
  Deluxe:       { amenities: ["WiFi", "Balcony", "Breakfast"], icons: ["wifi", "balcony", "flatware"] },
  Suite:        { amenities: ["Pool", "Spa", "Butler"],        icons: ["pool", "spa", "room_service"] },
  Presidential: { amenities: ["Concierge", "Pool", "Dining"],  icons: ["concierge", "pool", "dinner_dining"] },
};
const ROOM_CATEGORIES = ["All", "Standard", "Economy", "Deluxe", "Suite", "Presidential"];
const CATEGORY_META = {
  All:          { icon: "grid_view",         desc: "Every room in this hotel" },
  Standard:     { icon: "hotel",             desc: "Comfortable stays with essentials" },
  Economy:      { icon: "savings",           desc: "Smart value without compromise" },
  Deluxe:       { icon: "star_half",         desc: "Elevated comfort and premium views" },
  Suite:        { icon: "king_bed",          desc: "Expansive spaces for unforgettable stays" },
  Presidential: { icon: "workspace_premium", desc: "The pinnacle of luxury hospitality" },
};

function deriveCategory(typeName = "") {
  if (/presidential/i.test(typeName)) return "Presidential";
  if (/suite/i.test(typeName))        return "Suite";
  if (/deluxe/i.test(typeName))       return "Deluxe";
  if (/economy/i.test(typeName))      return "Economy";
  return "Standard";
}
function normalizeRoom(r) {
  const category = deriveCategory(r.room_type?.name);
  const { amenities, icons } = AMENITY_DEFAULTS[category];
  const primaryImg = r.images?.find((i) => i.is_primary) ?? r.images?.[0];
  return {
    id: r.id, hotel_id: r.hotel_id,
    name: r.room_type?.name || `Room ${r.room_number || r.id}`,
    category,
    description: r.description || `A ${category.toLowerCase()} room with premium amenities.`,
    price_per_night: Number(r.base_price) || 0,
    capacity: r.capacity || 2,
    rating: 4.5,
    amenities, amenityIcons: icons,
    tags: [category === "Economy" ? "Best Value" : "Free WiFi"],
    image: primaryImg?.image_url || FALLBACK_IMAGES[category],
  };
}
function getHotelImg(hotel) {
  const img = hotel?.images?.find((i) => i.is_primary) ?? hotel?.images?.[0];
  return img?.image_url || room1;
}

/* ── shared sub-components ───────────────────────────────────────────────── */
function StarRating({ rating }) {
  const n = Number(rating) || 0;
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

/* ── main component ──────────────────────────────────────────────────────── */
export default function Hotels() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle } = useWishlist();

  /* ── mode: "hotels" | "rooms" ── */
  const [mode, setMode] = useState(searchParams.get("hotel_id") ? "rooms" : "hotels");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState(false);

  /* ── hotel list state ── */
  const [hotels, setHotels]           = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [hotelSearch, setHotelSearch] = useState("");
  const [cities, setCities]           = useState([]);
  const [countries, setCountries]     = useState([]);
  const [minRating, setMinRating]     = useState(0);
  const [hotelSort, setHotelSort]     = useState("rating");
  const [hotelView, setHotelView]     = useState("grid");
  const [expandCity, setExpandCity]   = useState(true);
  const [expandCountry, setExpandCountry] = useState(true);
  const [expandRating, setExpandRating]   = useState(true);

  /* ── room list state ── */
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms]             = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomCategory, setRoomCategory] = useState("All");
  const [roomSort, setRoomSort]       = useState("default");
  const [roomView, setRoomView]       = useState("grid");

  /* ── fetch hotels on mount ── */
  useEffect(() => {
    api.get("/public/search/hotels/browse?per_page=100")
      .then((res) => setHotels(res.data))
      .catch(() => {})
      .finally(() => setHotelsLoading(false));
  }, []);

  /* ── auto-select hotel from URL param ── */
  useEffect(() => {
    const idParam = searchParams.get("hotel_id");
    if (idParam && hotels.length > 0) {
      const h = hotels.find((x) => x.id === Number(idParam));
      if (h) enterRoomMode(h);
    }
  }, [hotels, searchParams]);  // eslint-disable-line

  /* ── hotel derived values ── */
  const allCities    = useMemo(() => [...new Set(hotels.map((h) => h.city).filter(Boolean))].sort(), [hotels]);
  const allCountries = useMemo(() => [...new Set(hotels.map((h) => h.country).filter(Boolean))].sort(), [hotels]);

  const filteredHotels = useMemo(() => {
    let list = hotels;
    if (hotelSearch.trim()) {
      const q = hotelSearch.toLowerCase();
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
    if (hotelSort === "rating")    return [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
    if (hotelSort === "name-asc")  return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (hotelSort === "name-desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [hotels, hotelSearch, cities, countries, minRating, hotelSort]);

  const hotelActiveFilters = [
    ...cities.map((c) => ({ label: c, clear: () => setCities((p) => p.filter((x) => x !== c)) })),
    ...countries.map((c) => ({ label: c, clear: () => setCountries((p) => p.filter((x) => x !== c)) })),
    ...(minRating > 0 ? [{ label: `${minRating}★ & up`, clear: () => setMinRating(0) }] : []),
    ...(hotelSearch.trim() ? [{ label: `"${hotelSearch}"`, clear: () => setHotelSearch("") }] : []),
  ];

  /* ── room derived values ── */
  const filteredRooms = useMemo(() => {
    let list = roomCategory === "All" ? rooms : rooms.filter((r) => r.category === roomCategory);
    if (roomSort === "price-asc")  return [...list].sort((a, b) => a.price_per_night - b.price_per_night);
    if (roomSort === "price-desc") return [...list].sort((a, b) => b.price_per_night - a.price_per_night);
    if (roomSort === "rating")     return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [rooms, roomCategory, roomSort]);

  /* ── actions ── */
  function enterRoomMode(hotel) {
    setSelectedHotel(hotel);
    setMode("rooms");
    setRoomCategory("All");
    setRoomsLoading(true);
    api.get(`/public/search/rooms?hotel_id=${hotel.id}`)
      .then((res) => setRooms(res.data.map(normalizeRoom)))
      .catch(() => setRooms([]))
      .finally(() => setRoomsLoading(false));
    setSearchParams({ hotel_id: hotel.id });
    setMobileOpen(false);
  }

  function backToHotels() {
    setMode("hotels");
    setSelectedHotel(null);
    setRooms([]);
    setRoomCategory("All");
    setSearchParams({});
  }

  function toggleWishlist(e, roomId) {
    e.preventDefault();
    if (!isAuthenticated) { setAuthModal(true); return; }
    toggle(roomId);
  }

  function clearHotelFilters() {
    setHotelSearch(""); setCities([]); setCountries([]); setMinRating(0);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SIDEBAR
  ══════════════════════════════════════════════════════════════════════════ */
  const HotelSidebar = (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-slate-900">Filters</h2>
        {hotelActiveFilters.length > 0 && (
          <button onClick={clearHotelFilters} className="text-xs font-bold text-primary hover:underline">Clear all</button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
        <input type="text" value={hotelSearch} onChange={(e) => setHotelSearch(e.target.value)}
          placeholder="Search hotels, cities…"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary/60" />
        {hotelSearch && (
          <button onClick={() => setHotelSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* City */}
      {allCities.length > 0 && (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <button onClick={() => setExpandCity((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-bold text-slate-800">City</span>
            <span className="material-symbols-outlined text-sm text-slate-500">{expandCity ? "expand_less" : "expand_more"}</span>
          </button>
          {expandCity && (
            <div className="px-4 py-3 space-y-2 max-h-52 overflow-y-auto">
              {allCities.map((city) => (
                <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
                  <div onClick={() => setCities((p) => p.includes(city) ? p.filter((x) => x !== city) : [...p, city])}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${cities.includes(city) ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"}`}>
                    {cities.includes(city) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{city}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{hotels.filter((h) => h.city === city).length}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Country */}
      {allCountries.length > 0 && (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <button onClick={() => setExpandCountry((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="text-sm font-bold text-slate-800">Country</span>
            <span className="material-symbols-outlined text-sm text-slate-500">{expandCountry ? "expand_less" : "expand_more"}</span>
          </button>
          {expandCountry && (
            <div className="px-4 py-3 space-y-2 max-h-44 overflow-y-auto">
              {allCountries.map((country) => (
                <label key={country} className="flex items-center gap-2.5 cursor-pointer group">
                  <div onClick={() => setCountries((p) => p.includes(country) ? p.filter((x) => x !== country) : [...p, country])}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${countries.includes(country) ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"}`}>
                    {countries.includes(country) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{country}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{hotels.filter((h) => h.country === country).length}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Star rating */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <button onClick={() => setExpandRating((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-sm font-bold text-slate-800">Star Rating</span>
          <span className="material-symbols-outlined text-sm text-slate-500">{expandRating ? "expand_less" : "expand_more"}</span>
        </button>
        {expandRating && (
          <div className="px-4 py-3 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <label key={star} className="flex items-center gap-2.5 cursor-pointer group">
                <div onClick={() => setMinRating(minRating === star ? 0 : star)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${minRating === star ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"}`}>
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
    </div>
  );

  const RoomSidebar = (
    <div className="space-y-2">
      {/* Back to hotels */}
      <button onClick={backToHotels}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all mb-4">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        All Hotels
      </button>

      {/* Selected hotel summary */}
      {selectedHotel && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/15 rounded-xl mb-4">
          <img src={getHotelImg(selectedHotel)} alt={selectedHotel.name}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
            onError={(e) => { e.target.src = room1; }} />
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-primary truncate">{selectedHotel.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{[selectedHotel.city, selectedHotel.country].filter(Boolean).join(", ")}</p>
            {Number(selectedHotel.rating) > 0 && <StarRating rating={selectedHotel.rating} />}
          </div>
        </div>
      )}

      {/* Room type filter */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50">
          <span className="text-sm font-bold text-slate-800">Room Type</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {ROOM_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <div onClick={() => setRoomCategory(cat)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${roomCategory === cat ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"}`}>
                {roomCategory === cat && <span className="w-2 h-2 rounded-full bg-white block" />}
              </div>
              <span className="text-sm text-slate-700 flex-1">{cat === "All" ? "All Types" : cat}</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {cat === "All" ? rooms.length : rooms.filter((r) => r.category === cat).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50">
          <span className="text-sm font-bold text-slate-800">Sort by</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            { val: "default",    label: "Default" },
            { val: "price-asc",  label: "Price: Low → High" },
            { val: "price-desc", label: "Price: High → Low" },
            { val: "rating",     label: "Top Rated" },
          ].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <div onClick={() => setRoomSort(val)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${roomSort === val ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"}`}>
                {roomSort === val && <span className="w-2 h-2 rounded-full bg-white block" />}
              </div>
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-[88px] pb-20">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div>
            {mode === "hotels" ? (
              <>
                <h1 className="text-2xl font-extrabold text-slate-900">Hotels</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {hotelsLoading ? "Loading…" : `${filteredHotels.length} hotel${filteredHotels.length !== 1 ? "s" : ""} found`}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <button onClick={backToHotels} className="hover:text-primary font-semibold transition-colors">Hotels</button>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="font-bold text-slate-800">{selectedHotel?.name}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {selectedHotel?.name} — Rooms
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {roomsLoading ? "Loading…" : `${filteredRooms.length} room${filteredRooms.length !== 1 ? "s" : ""} available`}
                </p>
              </>
            )}
          </div>

          {/* Mobile filter button */}
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-base">tune</span>
            Filters
            {hotelActiveFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center">{hotelActiveFilters.length}</span>
            )}
          </button>
        </div>

        {/* ── Active filter chips (hotel mode only) ── */}
        {mode === "hotels" && hotelActiveFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hotelActiveFilters.map(({ label, clear }, i) => (
              <span key={i} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                {label}
                <button onClick={clear} className="ml-0.5 hover:opacity-70">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
            <button onClick={clearHotelFilters} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-1">Clear all</button>
          </div>
        )}

        <div className="flex gap-6">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden md:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-[88px] bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              {mode === "hotels" ? HotelSidebar : RoomSidebar}
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-sm font-bold text-slate-700">
                {mode === "hotels"
                  ? (hotelsLoading ? "Loading…" : `${filteredHotels.length} result${filteredHotels.length !== 1 ? "s" : ""}`)
                  : (roomsLoading ? "Loading…" : `${filteredRooms.length} room${filteredRooms.length !== 1 ? "s" : ""}`)}
              </p>
              <div className="flex items-center gap-3">
                {mode === "hotels" ? (
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Sort:</span>
                    <select value={hotelSort} onChange={(e) => setHotelSort(e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/60 bg-white cursor-pointer">
                      <option value="rating">Top Rated</option>
                      <option value="name-asc">Name A → Z</option>
                      <option value="name-desc">Name Z → A</option>
                    </select>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Sort:</span>
                    <select value={roomSort} onChange={(e) => setRoomSort(e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/60 bg-white cursor-pointer">
                      <option value="default">Default</option>
                      <option value="price-asc">Price: Low → High</option>
                      <option value="price-desc">Price: High → Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5">
                  <button onClick={() => mode === "hotels" ? setHotelView("grid") : setRoomView("grid")}
                    className={`p-1.5 rounded-md transition-all ${(mode === "hotels" ? hotelView : roomView) === "grid" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                  <button onClick={() => mode === "hotels" ? setHotelView("list") : setRoomView("list")}
                    className={`p-1.5 rounded-md transition-all ${(mode === "hotels" ? hotelView : roomView) === "list" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
                    <span className="material-symbols-outlined text-sm">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ════════════ HOTEL MODE ════════════ */}
            {mode === "hotels" && (
              <>
                {hotelsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                        <div className="aspect-[4/3] bg-slate-100" />
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                          <div className="h-8 bg-slate-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredHotels.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
                    <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">search_off</span>
                    <p className="font-extrabold text-slate-700 text-lg mb-1">No hotels found</p>
                    <p className="text-sm text-slate-400 mb-6">Try adjusting your filters.</p>
                    <button onClick={clearHotelFilters}
                      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                      <span className="material-symbols-outlined text-sm">refresh</span>Clear filters
                    </button>
                  </div>
                ) : hotelView === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredHotels.map((hotel, i) => {
                      const img = getHotelImg(hotel);
                      return (
                        <div key={hotel.id} className="bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-2xl overflow-hidden transition-all duration-300 group animate-fade-up cursor-pointer"
                          style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                          onClick={() => enterRoomMode(hotel)}>
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
                            <h3 className="font-extrabold text-slate-900 mt-1.5 mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-1">{hotel.name}</h3>
                            {hotel.description && <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{hotel.description}</p>}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <div className="flex gap-1.5 flex-wrap">
                                {hotel.city && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{hotel.city}</span>}
                              </div>
                              <span className="flex items-center gap-1 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg group-hover:shadow-md group-hover:shadow-primary/25 transition-all">
                                <span className="material-symbols-outlined text-xs">bed</span>
                                View Rooms
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHotels.map((hotel, i) => {
                      const img = getHotelImg(hotel);
                      return (
                        <div key={hotel.id} className="flex bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-300 group animate-fade-up cursor-pointer"
                          style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                          onClick={() => enterRoomMode(hotel)}>
                          <div className="w-52 md:w-72 shrink-0 relative overflow-hidden">
                            <img src={img} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.src = room1; }} />
                            {Number(hotel.rating) >= 4.5 && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">Top Rated</span>
                            )}
                          </div>
                          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors truncate">{hotel.name}</h3>
                              {(hotel.city || hotel.country) && (
                                <p className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                                  <span className="material-symbols-outlined text-xs">location_on</span>
                                  {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                                </p>
                              )}
                              {Number(hotel.rating) > 0 && <div className="mt-2"><StarRating rating={hotel.rating} /></div>}
                              {hotel.description && <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">{hotel.description}</p>}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                              <div className="flex gap-2 flex-wrap">
                                {hotel.city && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{hotel.city}</span>}
                                {Number(hotel.rating) > 0 && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{Number(hotel.rating).toFixed(1)} ★</span>}
                              </div>
                              <span className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl group-hover:shadow-md transition-all shrink-0">
                                <span className="material-symbols-outlined text-xs">bed</span>View Rooms
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ════════════ ROOM MODE ════════════ */}
            {mode === "rooms" && (
              <>
                {/* Room type tabs */}
                <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: "none" }}>
                  {ROOM_CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setRoomCategory(cat)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                        roomCategory === cat ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                      }`}>
                      <span className="material-symbols-outlined text-xs"
                        style={{ fontVariationSettings: roomCategory === cat ? "'FILL' 1" : "'FILL' 0" }}>{CATEGORY_META[cat].icon}</span>
                      {cat}
                      {cat !== "All" && (
                        <span className={`text-[9px] px-1 py-0.5 rounded-full ${roomCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {rooms.filter((r) => r.category === cat).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {roomsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                        <div className="aspect-[4/3] bg-slate-100" />
                        <div className="p-5 space-y-3">
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                          <div className="h-8 bg-slate-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
                    <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">bed</span>
                    <p className="font-extrabold text-slate-700 text-lg mb-1">No rooms available</p>
                    <p className="text-sm text-slate-400 mb-6">
                      {roomCategory !== "All" ? `No ${roomCategory} rooms in this hotel.` : "This hotel has no rooms listed yet."}
                    </p>
                    {roomCategory !== "All" && (
                      <button onClick={() => setRoomCategory("All")}
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                        Show all rooms
                      </button>
                    )}
                  </div>
                ) : roomView === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredRooms.map((room, i) => (
                      <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                        className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 animate-fade-up"
                        style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = room1; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/95 text-primary px-2.5 py-1 rounded-full shadow-sm">{room.category}</span>
                          </div>
                          <button type="button" onClick={(e) => toggleWishlist(e, room.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                            <span className={`material-symbols-outlined text-sm ${isSaved(room.id) ? "text-rose-500" : "text-slate-300"}`}
                              style={{ fontVariationSettings: isSaved(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                          </button>
                          {room.tags.slice(0, 1).map((tag) => (
                            <div key={tag} className="absolute bottom-3 left-3">
                              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-1 rounded-full">{tag}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-5">
                          <StarRating rating={room.rating} />
                          <h3 className="font-extrabold text-slate-900 mt-2 mb-1 group-hover:text-primary transition-colors leading-tight">{room.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{room.description}</p>
                          <div className="flex flex-wrap gap-3 mb-4">
                            {room.amenities.map((a, idx) => (
                              <div key={a} className="flex items-center gap-1 text-slate-500">
                                <span className="material-symbols-outlined text-xs">{room.amenityIcons[idx]}</span>
                                <span className="text-[10px] font-semibold">{a}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-1 text-slate-500">
                              <span className="material-symbols-outlined text-xs">group</span>
                              <span className="text-[10px] font-semibold">Up to {room.capacity}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold block">From</span>
                              <span className="text-xl font-extrabold text-primary">${room.price_per_night}
                                <span className="text-xs font-medium text-slate-400"> /night</span>
                              </span>
                            </div>
                            <span className="bg-primary/8 text-primary text-xs font-bold px-3 py-1.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">View</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRooms.map((room, i) => (
                      <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                        className="group flex bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-300 animate-fade-up"
                        style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                        <div className="w-44 md:w-60 shrink-0 relative overflow-hidden">
                          <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = room1; }} />
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-bold bg-white/95 text-primary px-2 py-0.5 rounded-full">{room.category}</span>
                          </div>
                          <button type="button" onClick={(e) => toggleWishlist(e, room.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center hover:scale-110 transition-transform">
                            <span className={`material-symbols-outlined text-xs ${isSaved(room.id) ? "text-rose-500" : "text-slate-300"}`}
                              style={{ fontVariationSettings: isSaved(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                          </button>
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="min-w-0">
                                <StarRating rating={room.rating} />
                                <h3 className="font-extrabold text-slate-900 mt-1 group-hover:text-primary transition-colors truncate">{room.name}</h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{room.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs text-slate-400 block">From</span>
                                <span className="text-2xl font-extrabold text-primary">${room.price_per_night}</span>
                                <span className="text-xs text-slate-400 block">/night</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-slate-400 overflow-hidden">
                              {room.amenities.slice(0, 3).map((a, idx) => (
                                <div key={a} className="flex items-center gap-1 shrink-0">
                                  <span className="material-symbols-outlined text-xs">{room.amenityIcons[idx]}</span>
                                  <span className="text-[10px] font-semibold">{a}</span>
                                </div>
                              ))}
                            </div>
                            <span className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 group-hover:bg-primary/90 transition-all">View Details</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white shadow-2xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-extrabold text-slate-900">Filters</span>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {mode === "hotels" ? HotelSidebar : RoomSidebar}
            <button onClick={() => setMobileOpen(false)}
              className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
              Show {mode === "hotels" ? filteredHotels.length : filteredRooms.length} result{(mode === "hotels" ? filteredHotels : filteredRooms).length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* ── Auth gate modal ── */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900">Sign in to save</p>
                <p className="text-xs text-slate-500 mt-0.5">Create an account to keep your favourite rooms.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/login")} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">Sign in</button>
              <button onClick={() => navigate("/register")} className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Create account</button>
              <button onClick={() => setAuthModal(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
