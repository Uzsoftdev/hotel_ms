import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import BookingSearchBar from "../../components/public/BookingSearchBar";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import api from "../../services/api";
import room1 from "../../assets/images/room1.png";
import room2 from "../../assets/images/room2.png";
import hotel3 from "../../assets/images/hotel3.png";
import bali from "../../assets/images/bali_1.png";

/* ── constants ───────────────────────────────────────────────────────────── */
const ROOM_GRADIENTS = {
  "Standard Room": "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  "Deluxe Room":   "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)",
  "Junior Suite":  "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)",
  "Penthouse":     "linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)",
  "Residence":     "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",
};

const AMENITY_DEFAULTS = {
  "Standard Room": { amenities: ["WiFi", "A/C", "TV"],             icons: ["wifi","ac_unit","tv"] },
  "Deluxe Room":   { amenities: ["WiFi", "Balcony", "Breakfast"],  icons: ["wifi","balcony","flatware"] },
  "Junior Suite":  { amenities: ["Pool", "Spa", "Butler"],         icons: ["pool","spa","room_service"] },
  "Penthouse":     { amenities: ["Concierge", "Pool", "Dining"],   icons: ["concierge","pool","dinner_dining"] },
  "Residence":     { amenities: ["Kitchen", "Laundry", "Parking"], icons: ["kitchen","local_laundry_service","local_parking"] },
};

const SQFT = { "Standard Room": 320, "Deluxe Room": 450, "Junior Suite": 640, "Penthouse": 820, "Residence": 1200 };

const ROOM_TYPE_LABELS = ["Standard Room","Deluxe Room","Junior Suite","Penthouse","Residence"];
const CAPACITY_LABELS  = ["1 guest","2 guests","3–4 guests","5+ guests"];
const AMENITY_LABELS   = ["Ocean view","Private balcony","Plunge pool","Butler service","Kitchenette","Pet-friendly"];
const PRICE_MIN = 0;
const PRICE_MAX = 2400;

/* ── helpers ─────────────────────────────────────────────────────────────── */
function deriveCategory(typeName = "") {
  if (/presidential/i.test(typeName)) return "Penthouse";
  if (/suite/i.test(typeName))        return "Junior Suite";
  if (/deluxe/i.test(typeName))       return "Deluxe Room";
  if (/economy/i.test(typeName))      return "Standard Room";
  return "Standard Room";
}

function normalizeRoom(r) {
  const rawTypeName = r.room_type?.name || "";
  // Discard stub/code names (< 4 chars like "Mo", "St") — use room number instead
  const typeName = rawTypeName.trim().length >= 4 ? rawTypeName.trim() : "";
  const category = deriveCategory(typeName || rawTypeName);
  const { amenities, icons } = AMENITY_DEFAULTS[category] || AMENITY_DEFAULTS["Standard Room"];
  const primaryImg = r.images?.find((i) => i.is_primary) ?? r.images?.[0];
  // Try multiple price field names the API might return
  const price = Number(r.base_price ?? r.price_per_night ?? r.price ?? 0);
  return {
    id: r.id,
    hotel_id: r.hotel_id,
    name: typeName || `Room ${r.room_number || r.id}`,
    category,
    description: r.description || `A ${category.toLowerCase()} with premium amenities.`,
    price_per_night: price,
    capacity: r.capacity || 2,
    rating: 4.5,
    amenities,
    amenityIcons: icons,
    image: primaryImg?.image_url || null,
    sqft: SQFT[category] || 320,
  };
}

function getHotelImg(hotel) {
  const img = hotel?.images?.find((i) => i.is_primary) ?? hotel?.images?.[0];
  return img?.image_url || room1;
}

function formatDate(s) {
  if (!s) return "";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getBadge(i, total) {
  if (i === 0 && total > 1) return { label: "MOST LOVED", bg: "#dcfce7", color: "#15803d" };
  const left = total - i;
  if (left === 1)       return { label: "LAST 1",    bg: "#fce7f3", color: "#be185d" };
  if (left <= 4)        return { label: `${left} LEFT`, bg: "#ccfbf1", color: "#0f766e" };
  if (left <= 12)       return { label: `${left} LEFT`, bg: "#fef9c3", color: "#854d0e" };
  return null;
}

/* ── FilterCheckbox ──────────────────────────────────────────────────────── */
function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
      <div onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
          checked ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"
        }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

/* ── PriceRangeSlider ────────────────────────────────────────────────────── */
function PriceRangeSlider({ value, onChange }) {
  const [lo, hi] = value;
  const loP = ((lo - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const hiP = ((hi - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
        <span>${lo.toLocaleString()}</span>
        <span>–</span>
        <span>${hi.toLocaleString()}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full">
          <div className="absolute h-full bg-blue-600 rounded-full"
            style={{ left: `${loP}%`, right: `${100 - hiP}%` }} />
        </div>
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} value={lo}
          onChange={(e) => { const v = +e.target.value; if (v < hi - 50) onChange([v, hi]); }}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 2 }} />
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} value={hi}
          onChange={(e) => { const v = +e.target.value; if (v > lo + 50) onChange([lo, v]); }}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 3 }} />
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow pointer-events-none"
          style={{ left: `calc(${loP}% - 8px)` }} />
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow pointer-events-none"
          style={{ left: `calc(${hiP}% - 8px)` }} />
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────────────── */
export default function Hotels() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle } = useWishlist();

  const [mode, setMode]                   = useState(searchParams.get("hotel_id") ? "rooms" : "hotels");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [authModal, setAuthModal]         = useState(false);

  /* hotel state */
  const [hotels, setHotels]               = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [hotelsError, setHotelsError]     = useState(false);
  const [hotelSearch, setHotelSearch]     = useState("");

  /* room state */
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms]                 = useState([]);
  const [roomsLoading, setRoomsLoading]   = useState(false);
  const [roomsError, setRoomsError]       = useState(false);

  /* search bar */
  const todayStr     = new Date().toISOString().split("T")[0];
  const fiveDaysStr  = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];
  const [checkIn, setCheckIn]             = useState(todayStr);
  const [checkOut, setCheckOut]           = useState(fiveDaysStr);
  const [guestAdults, setGuestAdults]     = useState(2);
  const [guestChildren, setGuestChildren] = useState(0);

  /* filters */
  const [priceRange, setPriceRange]               = useState([PRICE_MIN, PRICE_MAX]);
  const [selectedTypes, setSelectedTypes]         = useState([]);
  const [selectedCaps, setSelectedCaps]           = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy]                       = useState("recommended");

  /* fetch hotels */
  function extractList(data) {
    if (Array.isArray(data)) return data;
    // Handle paginated wrappers: { items: [...] } / { data: [...] } / { results: [...] } / { hotels: [...] }
    if (data && typeof data === "object") {
      const v = data.items ?? data.data ?? data.results ?? data.hotels;
      if (Array.isArray(v)) return v;
    }
    return null;
  }

  const fetchHotels = useCallback(() => {
    setHotelsLoading(true);
    setHotelsError(false);
    api.get("/public/search/hotels/browse?per_page=100&page=1")
      .then((res) => {
        const list = extractList(res.data);
        if (list === null) { setHotelsError(true); return; }
        setHotels(list);
        // Page 2 is best-effort — never causes an error state
        api.get("/public/search/hotels/browse?per_page=100&page=2")
          .then((res2) => {
            const list2 = extractList(res2.data);
            if (list2 && list2.length > 0) setHotels((prev) => [...prev, ...list2]);
          })
          .catch(() => {});
      })
      .catch(() => setHotelsError(true))
      .finally(() => setHotelsLoading(false));
  }, []);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  /* auto-enter room mode from URL — guarded to prevent loop */
  useEffect(() => {
    const id = searchParams.get("hotel_id");
    if (id && hotels.length > 0 && mode !== "rooms") {
      const h = hotels.find((x) => x.id === Number(id));
      if (h) enterRoomMode(h);
    }
  }, [hotels, searchParams]); // eslint-disable-line

  /* derived */
  const filteredHotels = useMemo(() => {
    if (!hotelSearch.trim()) return hotels;
    const q = hotelSearch.toLowerCase();
    return hotels.filter((h) =>
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.country?.toLowerCase().includes(q)
    );
  }, [hotels, hotelSearch]);

  const normalizedRooms = useMemo(() => rooms.map(normalizeRoom), [rooms]);

  const nights = useMemo(() => {
    const diff = (new Date(checkOut) - new Date(checkIn)) / 86400000;
    return Math.max(1, diff || 1);
  }, [checkIn, checkOut]);

  const filteredRooms = useMemo(() => {
    let list = normalizedRooms.filter((r) => {
      if (r.price_per_night < priceRange[0] || r.price_per_night > priceRange[1]) return false;
      if (selectedTypes.length && !selectedTypes.includes(r.category)) return false;
      if (selectedCaps.length) {
        const cap = r.capacity;
        const match = selectedCaps.some((c) => {
          if (c === "1 guest")    return cap === 1;
          if (c === "2 guests")   return cap === 2;
          if (c === "3–4 guests") return cap >= 3 && cap <= 4;
          if (c === "5+ guests")  return cap >= 5;
          return false;
        });
        if (!match) return false;
      }
      return true;
    });
    if (sortBy === "price-asc")  return [...list].sort((a, b) => a.price_per_night - b.price_per_night);
    if (sortBy === "price-desc") return [...list].sort((a, b) => b.price_per_night - a.price_per_night);
    if (sortBy === "rating")     return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [normalizedRooms, priceRange, selectedTypes, selectedCaps, sortBy]);

  const hasActiveFilters = selectedTypes.length > 0 || selectedCaps.length > 0 ||
    selectedAmenities.length > 0 || priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;

  /* actions */
  function fetchRooms(hotel) {
    setRoomsLoading(true);
    setRoomsError(false);
    api.get(`/public/search/rooms?hotel_id=${hotel.id}`)
      .then((res) => setRooms(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRoomsError(true))
      .finally(() => setRoomsLoading(false));
  }

  function enterRoomMode(hotel) {
    setSelectedHotel(hotel);
    setMode("rooms");
    setRooms([]);
    setRoomsError(false);
    fetchRooms(hotel);
    setSearchParams({ hotel_id: hotel.id });
    setMobileFiltersOpen(false);
  }

  function backToHotels() {
    setMode("hotels");
    setSelectedHotel(null);
    setRooms([]);
    setSearchParams({});
  }

  function toggleWishlist(e, roomId) {
    e.preventDefault();
    if (!isAuthenticated) { setAuthModal(true); return; }
    toggle(roomId);
  }

  function clearFilters() {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedTypes([]);
    setSelectedCaps([]);
    setSelectedAmenities([]);
  }

  function toggleItem(arr, setArr, item) {
    setArr((p) => p.includes(item) ? p.filter((x) => x !== item) : [...p, item]);
  }

  /* ── FILTERS PANEL ──────────────────────────────────────────────────────── */
  const FiltersPanel = (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Filters</h2>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm font-semibold text-blue-600 hover:underline">Clear all</button>
        )}
      </div>

      <div className="pb-5 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800 mb-4">Price per night</p>
        <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
      </div>

      <div className="py-5 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800 mb-1">Room type</p>
        {ROOM_TYPE_LABELS.map((t) => (
          <FilterCheckbox key={t} label={t} checked={selectedTypes.includes(t)}
            onChange={() => toggleItem(selectedTypes, setSelectedTypes, t)} />
        ))}
      </div>

      <div className="py-5 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800 mb-1">Capacity</p>
        {CAPACITY_LABELS.map((c) => (
          <FilterCheckbox key={c} label={c} checked={selectedCaps.includes(c)}
            onChange={() => toggleItem(selectedCaps, setSelectedCaps, c)} />
        ))}
      </div>

      <div className="pt-5">
        <p className="text-sm font-semibold text-slate-800 mb-1">Amenities</p>
        {AMENITY_LABELS.map((a) => (
          <FilterCheckbox key={a} label={a} checked={selectedAmenities.includes(a)}
            onChange={() => toggleItem(selectedAmenities, setSelectedAmenities, a)} />
        ))}
      </div>
    </div>
  );

  /* ── RENDER ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      <Navbar />

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 shadow-sm" style={{ paddingTop: 72 }}>
        <div className="max-w-[1300px] mx-auto px-6 py-4">
          <BookingSearchBar />
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1300px] mx-auto px-6 pt-8 pb-24 flex gap-7">

        {/* Sidebar (rooms mode only) */}
        {mode === "rooms" && (
          <aside className="hidden md:block w-64 xl:w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm sticky top-24">
              {FiltersPanel}
            </div>
          </aside>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ════════ HOTEL MODE ════════ */}
          {mode === "hotels" && (
            <>
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-slate-900">
                  {hotelsLoading ? "Finding hotels…" : `${filteredHotels.length} hotel${filteredHotels.length !== 1 ? "s" : ""} available`}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">{formatDate(checkIn)} → {formatDate(checkOut)}</p>
              </div>

              {hotelsLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden flex animate-pulse h-40">
                      <div className="w-48 bg-slate-100 shrink-0" />
                      <div className="flex-1 p-5 space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : hotelsError ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-24 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">wifi_off</span>
                  <p className="font-bold text-slate-700 text-lg mb-1">Couldn't load hotels</p>
                  <p className="text-sm text-slate-400 mb-6">Check your connection and try again.</p>
                  <button onClick={fetchHotels}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-sm">refresh</span>Retry
                  </button>
                </div>
              ) : filteredHotels.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-24 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">search_off</span>
                  <p className="font-bold text-slate-700 text-lg mb-4">No hotels found</p>
                  <button onClick={() => setHotelSearch("")}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHotels.map((hotel) => {
                    const img = getHotelImg(hotel);
                    return (
                      <div key={hotel.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex"
                        onClick={() => enterRoomMode(hotel)}>
                        <div className="w-52 shrink-0 relative overflow-hidden" style={{ minHeight: 160 }}>
                          <img src={img} alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = room1; }} />
                          {Number(hotel.rating) >= 4.5 && (
                            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                              style={{ background: "#dcfce7", color: "#15803d" }}>Top Rated</span>
                          )}
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {hotel.name}
                            </h3>
                            {(hotel.city || hotel.country) && (
                              <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                              </p>
                            )}
                            {hotel.description && (
                              <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">{hotel.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {hotel.city && (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                                  style={{ background: "#dbeafe", color: "#1d4ed8" }}>{hotel.city}</span>
                              )}
                            </div>
                            <span className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl group-hover:bg-blue-700 transition-colors shrink-0">
                              View Rooms
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

          {/* ════════ ROOM MODE ════════ */}
          {mode === "rooms" && (
            <>
              {/* Results header */}
              <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {roomsLoading
                      ? "Loading rooms…"
                      : `${filteredRooms.length} room${filteredRooms.length !== 1 ? "s" : ""} · ${formatDate(checkIn)} → ${formatDate(checkOut)}`}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {guestAdults} adult{guestAdults !== 1 ? "s" : ""}
                    {guestChildren > 0 ? `, ${guestChildren} child${guestChildren !== 1 ? "ren" : ""}` : ""}
                    {" "}· {Math.round(nights)} night{nights !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-slate-500 font-medium">Sort:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-white cursor-pointer shadow-sm">
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Mobile back */}
              <button onClick={backToHotels}
                className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline mb-4">
                <span className="material-symbols-outlined text-sm">arrow_back</span>All Hotels
              </button>

              {roomsLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden flex animate-pulse" style={{ height: 190 }}>
                      <div className="w-56 bg-slate-100 shrink-0" />
                      <div className="flex-1 p-6 space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                      <div className="w-44 p-6 border-l border-slate-100 flex flex-col gap-3">
                        <div className="h-3 bg-slate-100 rounded" />
                        <div className="h-8 bg-slate-100 rounded" />
                        <div className="h-10 bg-slate-100 rounded mt-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : roomsError ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">wifi_off</span>
                  <p className="font-bold text-slate-700 text-lg mb-1">Couldn't load rooms</p>
                  <p className="text-sm text-slate-400 mb-6">The server didn't respond.</p>
                  <button onClick={() => fetchRooms(selectedHotel)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-sm">refresh</span>Retry
                  </button>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">bed</span>
                  <p className="font-bold text-slate-700 text-lg mb-4">No rooms match your filters</p>
                  <button onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map((room, i) => {
                    const badge = getBadge(i, filteredRooms.length);
                    const gradient = ROOM_GRADIENTS[room.category] || ROOM_GRADIENTS["Standard Room"];
                    const totalPrice = room.price_per_night * Math.round(nights);
                    return (
                      <div key={room.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow flex">

                        {/* Image */}
                        <div className="w-56 shrink-0 relative overflow-hidden" style={{ minHeight: 190, background: gradient }}>
                          {room.image && (
                            <img src={room.image} alt={room.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => e.target.remove()} />
                          )}
                          {badge && (
                            <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full"
                              style={{ background: badge.bg, color: badge.color }}>
                              {badge.label}
                            </span>
                          )}
                          <button type="button" onClick={(e) => toggleWishlist(e, room.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                            <span className={`material-symbols-outlined text-sm ${isSaved(room.id) ? "text-rose-500" : "text-slate-300"}`}
                              style={{ fontVariationSettings: isSaved(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                          </button>
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{room.name}</h3>
                            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">group</span>
                                {room.capacity} guest{room.capacity !== 1 ? "s" : ""}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">square_foot</span>
                                {room.sqft} ft²
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                {room.rating}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {room.amenities.map((a) => (
                                <span key={a} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{a}</span>
                              ))}
                            </div>
                          </div>
                          <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-4">
                            <span className="material-symbols-outlined text-base text-slate-400">check_circle</span>
                            Free cancellation until 48h before check-in
                          </p>
                        </div>

                        {/* Price + CTA */}
                        <div className="w-44 shrink-0 flex flex-col items-end justify-between p-5 border-l border-slate-100">
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">{Math.round(nights)} night{nights !== 1 ? "s" : ""}, all-in</p>
                            <p className="text-2xl font-extrabold text-slate-900">
                              ${totalPrice > 0 ? totalPrice.toLocaleString() : "—"}
                            </p>
                            {room.price_per_night > 0 && (
                              <p className="text-xs text-slate-400 mt-0.5">${room.price_per_night}/night</p>
                            )}
                          </div>
                          <Link to={`/room-details/${room.id}`} state={{ room }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors text-center block">
                            Book Now
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters FAB */}
      {mode === "rooms" && (
        <button onClick={() => setMobileFiltersOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-xl font-bold text-sm">
          <span className="material-symbols-outlined text-base">tune</span>
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white block shrink-0" />}
        </button>
      )}

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white shadow-2xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-slate-900 text-base">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {FiltersPanel}
            <button onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
              Show {filteredRooms.length} result{filteredRooms.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* Auth modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-5"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900">Sign in to save</p>
                <p className="text-xs text-slate-500 mt-0.5">Create an account to keep your favourite rooms.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Sign in</button>
              <button onClick={() => navigate("/register")}
                className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Create account</button>
              <button onClick={() => setAuthModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
