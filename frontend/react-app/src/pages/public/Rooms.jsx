import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROOMS } from "../../data/rooms";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import background from "../../assets/images/room_back.png";
import room1 from "../../assets/images/room1.png";
import room2 from "../../assets/images/room2.png";
import hotel3 from "../../assets/images/hotel3.png";
import bali from "../../assets/images/bali_1.png";
import api from "../../services/api";

const FALLBACK_IMAGES = { Standard: room1, Economy: room2, Deluxe: bali, Suite: hotel3, Presidential: bali };
const AMENITY_DEFAULTS = {
  Standard:     { amenities: ["WiFi", "A/C", "TV"],            icons: ["wifi", "ac_unit", "tv"] },
  Economy:      { amenities: ["WiFi", "TV"],                   icons: ["wifi", "tv"] },
  Deluxe:       { amenities: ["WiFi", "Balcony", "Breakfast"], icons: ["wifi", "balcony", "flatware"] },
  Suite:        { amenities: ["Pool", "Spa", "Butler"],        icons: ["pool", "spa", "room_service"] },
  Presidential: { amenities: ["Concierge", "Pool", "Dining"],  icons: ["concierge", "pool", "dinner_dining"] },
};

function deriveCategory(typeName = "") {
  if (/presidential/i.test(typeName)) return "Presidential";
  if (/suite/i.test(typeName))        return "Suite";
  if (/deluxe/i.test(typeName))       return "Deluxe";
  if (/economy/i.test(typeName))      return "Economy";
  return "Standard";
}

function normalizeApiRoom(r) {
  const category = deriveCategory(r.room_type?.name);
  const { amenities, icons } = AMENITY_DEFAULTS[category];
  const primaryImg = r.images?.find((i) => i.is_primary) ?? r.images?.[0];
  return {
    id: r.id,
    hotel_id: r.hotel_id,
    name: r.room_type?.name || `Room ${r.room_number || r.id}`,
    category,
    description: r.description || `A ${category.toLowerCase()} room with premium amenities.`,
    price_per_night: Number(r.base_price) || 0,
    capacity: r.capacity || 2,
    rating: 4.5,
    amenities,
    amenityIcons: icons,
    tags: [category === "Economy" ? "Best Value" : "Free WiFi"],
    image: primaryImg?.image_url || FALLBACK_IMAGES[category],
  };
}

function getHotelImg(hotel) {
  const img = hotel?.images?.find((i) => i.is_primary) ?? hotel?.images?.[0];
  return img?.image_url || room1;
}

const CATEGORIES = ["All", "Standard", "Economy", "Deluxe", "Suite", "Presidential"];
const CATEGORY_META = {
  All:          { icon: "grid_view",          desc: "Every room in our collection" },
  Standard:     { icon: "hotel",              desc: "Comfortable stays with all the essentials" },
  Economy:      { icon: "savings",            desc: "Smart value without compromise" },
  Deluxe:       { icon: "star_half",          desc: "Elevated comfort and premium views" },
  Suite:        { icon: "king_bed",           desc: "Expansive spaces for unforgettable stays" },
  Presidential: { icon: "workspace_premium",  desc: "The pinnacle of luxury hospitality" },
};

function StarRating({ rating, size = "text-xs" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined ${size} ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
      <span className="text-[10px] font-bold text-slate-500 ml-1">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

export default function Rooms() {
  const { t } = useTranslation("pub_translation");
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const navigate = useNavigate();
  const hotelScrollRef = useRef(null);

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState(ROOMS);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [hotelSearch, setHotelSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [view, setView] = useState("grid");
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hotelsMap = useMemo(
    () => Object.fromEntries(hotels.map((h) => [h.id, h])),
    [hotels],
  );
  const selectedHotel = selectedHotelId ? hotelsMap[selectedHotelId] : null;

  useEffect(() => {
    api.get("/public/search/hotels/browse").then((res) => setHotels(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setRoomsLoading(true);
    const url = selectedHotelId
      ? `/public/search/rooms?hotel_id=${selectedHotelId}`
      : "/public/search/rooms";
    api.get(url)
      .then((res) => {
        const normalized = res.data.map(normalizeApiRoom);
        setRooms(normalized.length > 0 ? normalized : selectedHotelId ? [] : ROOMS);
      })
      .catch(() => {})
      .finally(() => setRoomsLoading(false));
  }, [selectedHotelId]);

  const filteredHotels = useMemo(() => {
    if (!hotelSearch.trim()) return hotels;
    const q = hotelSearch.toLowerCase();
    return hotels.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.country?.toLowerCase().includes(q),
    );
  }, [hotels, hotelSearch]);

  const filteredRooms = useMemo(() => {
    let result = activeCategory === "All" ? rooms : rooms.filter((r) => r.category === activeCategory);
    if (sortBy === "price-asc")  return [...result].sort((a, b) => a.price_per_night - b.price_per_night);
    if (sortBy === "price-desc") return [...result].sort((a, b) => b.price_per_night - a.price_per_night);
    if (sortBy === "rating")     return [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [rooms, activeCategory, sortBy]);

  function toggleWishlist(e, id) {
    e.preventDefault();
    if (!isAuthenticated) { setAuthModal(true); return; }
    toggle(id);
  }

  function selectHotel(id) {
    setSelectedHotelId((prev) => (prev === id ? null : id));
    setActiveCategory("All");
  }

  function scrollHotels(dir) {
    if (hotelScrollRef.current) {
      hotelScrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
    }
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative h-64 md:h-80 flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={background} alt="Rooms" className="w-full h-full object-cover" style={{ filter: "brightness(.45)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pb-10">
          <nav className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white">Rooms</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-1">
            {t("rooms_page.hero.title") || "Find your room"}
          </h1>
          <p className="text-white/70 font-medium">
            {hotels.length > 0 ? `${hotels.length} hotel${hotels.length !== 1 ? "s" : ""} · ${rooms.length} rooms available` : "Browse our curated collection"}
          </p>
        </div>
      </section>

      {/* ── Hotel picker ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Choose a hotel</h2>
              <p className="text-xs text-slate-400 mt-0.5">Filter rooms by property</p>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
              <input
                type="text"
                placeholder="Search hotels or cities…"
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary/60 bg-slate-50"
              />
              {hotelSearch && (
                <button onClick={() => setHotelSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Scroll arrows (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              <button onClick={() => scrollHotels(-1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-all">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button onClick={() => scrollHotels(1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-all">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Hotel chips scroll */}
          <div ref={hotelScrollRef} className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {/* All Hotels chip */}
            <button
              onClick={() => { setSelectedHotelId(null); setActiveCategory("All"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 shrink-0 transition-all ${
                !selectedHotelId
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                  : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary bg-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
              <span className="text-xs font-bold whitespace-nowrap">All Hotels</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${!selectedHotelId ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                {rooms.length}
              </span>
            </button>

            {/* Hotel cards */}
            {filteredHotels.map((hotel) => {
              const img = getHotelImg(hotel);
              const isActive = selectedHotelId === hotel.id;
              return (
                <button
                  key={hotel.id}
                  onClick={() => selectHotel(hotel.id)}
                  className={`shrink-0 flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl border-2 transition-all text-left ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-slate-200 hover:border-primary/40 bg-white"
                  }`}
                >
                  <img
                    src={img}
                    alt={hotel.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                    onError={(e) => { e.target.src = room1; }}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold whitespace-nowrap truncate max-w-[120px] ${isActive ? "text-primary" : "text-slate-800"}`}>
                      {hotel.name}
                    </p>
                    {(hotel.city || hotel.country) && (
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">
                        {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {Number(hotel.rating) > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={`material-symbols-outlined text-[8px] ${i <= Math.round(Number(hotel.rating)) ? "text-amber-400" : "text-slate-200"}`}
                            style={{ fontVariationSettings: i <= Math.round(Number(hotel.rating)) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredHotels.length === 0 && hotelSearch && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <span className="material-symbols-outlined text-base">search_off</span>
                No hotels match "{hotelSearch}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Selected hotel banner ── */}
      {selectedHotel && (
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 border-b border-primary/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <img
              src={getHotelImg(selectedHotel)}
              alt={selectedHotel.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md shrink-0"
              onError={(e) => { e.target.src = room1; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-slate-900 text-lg truncate">{selectedHotel.name}</p>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {(selectedHotel.city || selectedHotel.country) && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {[selectedHotel.city, selectedHotel.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {Number(selectedHotel.rating) > 0 && <StarRating rating={Number(selectedHotel.rating)} />}
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}
                </span>
              </div>
              {selectedHotel.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{selectedHotel.description}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedHotelId(null)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all bg-white"
            >
              <span className="material-symbols-outlined text-xs">close</span>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                }`}>
                <span className="material-symbols-outlined text-xs"
                  style={{ fontVariationSettings: activeCategory === cat ? "'FILL' 1" : "'FILL' 0" }}>
                  {CATEGORY_META[cat].icon}
                </span>
                {cat}
                {cat !== "All" && (
                  <span className={`text-[9px] px-1 py-0.5 rounded-full ${activeCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {rooms.filter((r) => r.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Rating</option>
            </select>
            <span className="material-symbols-outlined text-xs text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-1 shrink-0">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
              <span className="material-symbols-outlined text-sm">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Results header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-1 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {selectedHotel ? `${selectedHotel.name} — ` : ""}{activeCategory === "All" ? "All Rooms" : `${activeCategory} Rooms`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {roomsLoading ? "Loading…" : `${filteredRooms.length} result${filteredRooms.length !== 1 ? "s" : ""} · ${CATEGORY_META[activeCategory].desc}`}
          </p>
        </div>
      </div>

      {/* ── Room grid / list ── */}
      <section className="max-w-7xl mx-auto px-6 py-4 pb-20">
        {/* Skeleton */}
        {roomsLoading && (
          <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid view */}
        {!roomsLoading && view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, i) => {
              const hotel = hotelsMap[room.hotel_id];
              return (
                <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                  className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-900/8 transition-all duration-300 card-hover animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden relative img-zoom">
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = room1; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
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
                    <h3 className="font-extrabold text-slate-900 mt-2 mb-0.5 group-hover:text-primary transition-colors leading-tight">{room.name}</h3>
                    {hotel && !selectedHotel && (
                      <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        {hotel.name}{hotel.city ? ` · ${hotel.city}` : ""}
                      </p>
                    )}
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
              );
            })}
          </div>
        )}

        {/* List view */}
        {!roomsLoading && view === "list" && (
          <div className="space-y-4">
            {filteredRooms.map((room, i) => {
              const hotel = hotelsMap[room.hotel_id];
              return (
                <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                  className="group flex bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                  <div className="w-44 md:w-60 shrink-0 relative overflow-hidden img-zoom">
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover"
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
                          {hotel && !selectedHotel && (
                            <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-0.5">
                              <span className="material-symbols-outlined text-[10px]">location_on</span>
                              {hotel.name}{hotel.city ? ` · ${hotel.city}` : ""}
                            </p>
                          )}
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
                      <div className="flex items-center gap-4 text-slate-400 overflow-hidden">
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
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!roomsLoading && filteredRooms.length === 0 && (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">search_off</span>
            <p className="font-extrabold text-slate-700 text-lg mb-1">No rooms found</p>
            <p className="text-sm text-slate-400 mb-6">
              {selectedHotel
                ? `${selectedHotel.name} has no ${activeCategory !== "All" ? activeCategory.toLowerCase() + " " : ""}rooms available.`
                : `No ${activeCategory !== "All" ? activeCategory.toLowerCase() + " " : ""}rooms match your filter.`}
            </p>
            <button
              onClick={() => { setSelectedHotelId(null); setActiveCategory("All"); }}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-50 border-t border-slate-100 py-14">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{t("rooms_page.common.cta_title") || "Need help choosing?"}</h2>
          <p className="text-slate-500 mb-8">{t("rooms_page.common.cta_subtitle") || "Our concierge team is here to help you find the perfect room."}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-base">call</span>
            {t("rooms_page.common.contact_concierge") || "Contact Concierge"}
          </Link>
        </div>
      </section>

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
