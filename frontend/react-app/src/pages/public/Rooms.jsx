import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROOMS } from "../../data/rooms";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import background from "../../assets/images/room_back.png";

const CATEGORIES = ["All", "Standard", "Economy", "Deluxe", "Suite", "Presidential"];

const CATEGORY_META = {
  All: { icon: "grid_view", desc: "Every room in our collection" },
  Standard: { icon: "hotel", desc: "Comfortable stays with all the essentials" },
  Economy: { icon: "savings", desc: "Smart value without compromise" },
  Deluxe: { icon: "star_half", desc: "Elevated comfort and premium views" },
  Suite: { icon: "king_bed", desc: "Expansive spaces for unforgettable stays" },
  Presidential: { icon: "workspace_premium", desc: "The pinnacle of luxury hospitality" },
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined text-xs ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
      <span className="text-xs font-bold text-slate-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Rooms() {
  const { t } = useTranslation("pub_translation");
  const [activeTab, setActiveTab] = useState("All");
  const [view, setView] = useState("grid"); // grid | list
  const [wishlist, setWishlist] = useState([]);

  const filtered = useMemo(() =>
    activeTab === "All" ? ROOMS : ROOMS.filter((r) => r.category === activeTab),
    [activeTab]
  );

  function toggleWishlist(e, id) {
    e.preventDefault();
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={background} alt="Our rooms" className="w-full h-full object-cover" style={{ filter: "brightness(.45)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pb-10">
          <nav className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white">Rooms</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">{t("rooms_page.hero.title") || "Our Rooms"}</h1>
          <p className="text-white/70 font-medium">{t("rooms_page.hero.subtitle") || "Find the perfect space for your stay"}</p>
        </div>
      </section>

      {/* Filter + View toggle bar */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveTab(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === cat
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                }`}>
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: activeTab === cat ? "'FILL' 1" : "'FILL' 0" }}>
                  {CATEGORY_META[cat].icon}
                </span>
                {cat}
                {cat !== "All" && (
                  <span className={`text-[9px] px-1 py-0.5 rounded-full ${activeTab === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {ROOMS.filter((r) => r.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0 border border-slate-200 rounded-lg p-1">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}>
              <span className="material-symbols-outlined text-sm">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category headline */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{activeTab === "All" ? "All Rooms" : `${activeTab} Rooms`}</h2>
          <p className="text-sm text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""} · {CATEGORY_META[activeTab].desc}</p>
        </div>
      </div>

      {/* Room grid / list */}
      <section className="max-w-7xl mx-auto px-6 py-6 pb-20">
        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((room, i) => (
              <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-900/8 transition-all duration-300 card-hover animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <div className="aspect-[4/3] overflow-hidden relative img-zoom">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/95 text-primary px-2.5 py-1 rounded-full shadow-sm">{room.category}</span>
                  </div>
                  <button type="button" onClick={(e) => toggleWishlist(e, room.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <span className={`material-symbols-outlined text-sm ${wishlist.includes(room.id) ? "text-rose-500" : "text-slate-300"}`}
                      style={{ fontVariationSettings: wishlist.includes(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
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
            {filtered.map((room, i) => (
              <Link key={room.id} to={`/room-details/${room.id}`} state={{ room }}
                className="group flex bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <div className="w-48 md:w-64 h-48 shrink-0 relative overflow-hidden img-zoom">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold bg-white/95 text-primary px-2 py-0.5 rounded-full">{room.category}</span>
                  </div>
                  <button type="button" onClick={(e) => toggleWishlist(e, room.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center hover:scale-110 transition-transform">
                    <span className={`material-symbols-outlined text-xs ${wishlist.includes(room.id) ? "text-rose-500" : "text-slate-300"}`}
                      style={{ fontVariationSettings: wishlist.includes(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                  </button>
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <StarRating rating={room.rating} />
                        <h3 className="font-extrabold text-slate-900 mt-1 group-hover:text-primary transition-colors">{room.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{room.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block">From</span>
                        <span className="text-2xl font-extrabold text-primary">${room.price_per_night}</span>
                        <span className="text-xs text-slate-400 block">/night</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {room.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-slate-400">
                      {room.amenities.map((a, idx) => (
                        <div key={a} className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">{room.amenityIcons[idx]}</span>
                          <span className="text-[10px] font-semibold">{a}</span>
                        </div>
                      ))}
                    </div>
                    <span className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl group-hover:bg-primary/90 transition-all">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 block mb-4">search_off</span>
            <p className="font-semibold text-slate-500">No rooms found in this category.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{t("rooms_page.common.cta_title") || "Need help choosing?"}</h2>
          <p className="text-slate-500 mb-8">{t("rooms_page.common.cta_subtitle") || "Our concierge team is here to help you find the perfect room."}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-base">call</span>
            {t("rooms_page.common.contact_concierge") || "Contact Concierge"}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
