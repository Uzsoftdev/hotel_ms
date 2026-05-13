import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "./Layout/UserLayout";
import { useWishlist } from "../../contexts/WishlistContext";
import api from "../../services/api";
import room1 from "../../assets/images/room1.png";
import room2 from "../../assets/images/room2.png";
import hotel3 from "../../assets/images/hotel3.png";
import bali from "../../assets/images/bali_1.png";

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

function normalizeRoom(r) {
  const category = deriveCategory(r.room_type?.name);
  const { amenities, icons } = AMENITY_DEFAULTS[category];
  const primaryImg = r.images?.find((i) => i.is_primary) ?? r.images?.[0];
  return {
    id: r.id,
    name: r.room_type?.name || `Room ${r.room_number || r.id}`,
    category,
    description: r.description || `A ${category.toLowerCase()} room with premium amenities.`,
    price_per_night: Number(r.base_price) || 0,
    rating: 4.5,
    amenities,
    amenityIcons: icons,
    image: primaryImg?.image_url || FALLBACK_IMAGES[category],
  };
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined text-xs ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
      <span className="text-xs font-bold text-slate-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function SavedRooms() {
  const { savedIds, toggle, loading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();
  const [allRooms, setAllRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  useEffect(() => {
    api.get("/public/search/rooms")
      .then((res) => setAllRooms(res.data.map(normalizeRoom)))
      .catch(() => {})
      .finally(() => setRoomsLoading(false));
  }, []);

  const loading = wishlistLoading || roomsLoading;

  const savedRooms = useMemo(
    () => allRooms.filter((r) => savedIds.has(r.id)),
    [allRooms, savedIds]
  );

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="ah-h1">Saved Rooms</h1>
            <p className="ah-muted text-sm mt-1">
              {loading ? "Loading…" : `${savedRooms.length} room${savedRooms.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          {savedRooms.length > 0 && (
            <Link to="/rooms" className="ah-btn ah-btn-primary ah-btn-sm">
              <span className="material-symbols-outlined text-sm">search</span>
              Browse more
            </Link>
          )}
        </div>

        {/* Empty state */}
        {!loading && savedRooms.length === 0 && (
          <div className="ah-card flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-rose-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: "var(--text)" }}>No saved rooms yet</p>
              <p className="ah-muted text-sm mt-1">Tap the heart icon on any room to save it here.</p>
            </div>
            <Link to="/rooms" className="ah-btn ah-btn-primary">
              <span className="material-symbols-outlined text-sm">hotel</span>
              Browse rooms
            </Link>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ah-card overflow-hidden">
                <div className="ah-skeleton h-44 rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="ah-skeleton h-4 w-3/4 rounded" />
                  <div className="ah-skeleton h-3 w-1/2 rounded" />
                  <div className="ah-skeleton h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved room cards */}
        {!loading && savedRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRooms.map((room) => (
              <div key={room.id} className="ah-card overflow-hidden group ah-card-hover">
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-white/95 text-primary px-2.5 py-1 rounded-full">
                    {room.category}
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => toggle(room.id)}
                    title="Remove from saved"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>

                  {/* Price overlay */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-white font-extrabold text-sm">${room.price_per_night}<span className="font-medium text-white/70 text-xs">/night</span></span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <StarRating rating={room.rating} />
                  <h3 className="font-extrabold mt-2 mb-1 group-hover:text-primary transition-colors" style={{ color: "var(--text)" }}>
                    {room.name}
                  </h3>
                  <p className="ah-muted text-xs line-clamp-2 mb-3">{room.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.map((a, idx) => (
                      <div key={a} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                        <span className="material-symbols-outlined text-xs">{room.amenityIcons[idx]}</span>
                        {a}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/room-details/${room.id}`}
                      state={{ room }}
                      className="flex-1 ah-btn ah-btn-secondary ah-btn-sm justify-center"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`/booking?room_id=${room.id}&price=${room.price_per_night}&room_name=${encodeURIComponent(room.name)}`, { state: { room } })}
                      className="flex-1 ah-btn ah-btn-primary ah-btn-sm justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">book_online</span>
                      Book now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
