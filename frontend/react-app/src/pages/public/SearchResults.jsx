import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import parisImage from "../../assets/images/paris_result.png";
import baliImage from "../../assets/images/bali_search.png";
import newyorkImage from "../../assets/images/new_york_search.png";

const resultImages = [parisImage, baliImage, newyorkImage, parisImage, baliImage, newyorkImage];

export default function SearchResults() {
  const { t } = useTranslation("pub_translation");

  const sortOptions = [
    t("search_results.sort_options.recommended"),
    t("search_results.sort_options.price_low_high"),
    t("search_results.sort_options.price_high_low"),
    t("search_results.sort_options.rating"),
  ];

  const amenities = [
    t("search_results.amenities_filter.wifi"),
    t("search_results.amenities_filter.pool"),
    t("search_results.amenities_filter.spa"),
    t("search_results.amenities_filter.parking"),
    t("search_results.amenities_filter.restaurant"),
  ];

  const results = useMemo(() => {
    const base = t("search_results.results", { returnObjects: true });
    const details = t("search_results.results_details", { returnObjects: true });

    if (!Array.isArray(base)) {
      return [];
    }

    return base.map((item, index) => {
      const detail = Array.isArray(details) ? details.find((d) => d.id === item.id) : undefined;
      return {
        ...item,
        image: resultImages[index],
        locationDetail: detail?.location_detail || item.location,
        tags: Array.isArray(detail?.tags) ? detail.tags : [],
      };
    });
  }, [t]);

  const [sort, setSort] = useState(sortOptions[0]);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState([]);

  const toggleFav = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const sorted = [...results].sort((a, b) => {
    if (sort === t("search_results.sort_options.price_low_high")) return a.price - b.price;
    if (sort === t("search_results.sort_options.price_high_low")) return b.price - a.price;
    if (sort === t("search_results.sort_options.rating")) return parseFloat(b.rating) - parseFloat(a.rating);
    return 0;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("navigation.home")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">{t("navigation.rooms")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">{t("navigation.about")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("navigation.contact")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">{t("navigation.register")}</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">{t("navigation.login")}</Link>
          </div>
        </div>
      </nav>

      <div className="w-full bg-surface-container-lowest/90 backdrop-blur-sm border-b border-outline-variant/50 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 divide-x divide-outline-variant">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("search_results.filter_bar.location")}</span>
              <span className="text-sm font-bold text-on-surface">{t("search_results.filter_bar.location_value")}</span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("search_results.filter_bar.dates")}</span>
              <span className="text-sm font-bold text-on-surface">{t("search_results.filter_bar.dates_value")}</span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("search_results.filter_bar.guests")}</span>
              <span className="text-sm font-bold text-on-surface">{t("search_results.filter_bar.guests_value")}</span>
            </div>
          </div>
          <Link to="/" className="bg-surface-container-highest text-on-surface px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-outline-variant transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">tune</span>
            {t("search_results.filter_bar.modify_search")}
          </Link>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex flex-col md:flex-row gap-10">
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">{t("search_results.sidebar.price_range")}</h3>
              <input className="w-full accent-primary cursor-pointer" max="2500" min="200" step="50" type="range" />
              <div className="flex justify-between mt-2">
                <span className="text-xs font-bold text-on-surface">$200</span>
                <span className="text-xs font-bold text-on-surface">$2,500+</span>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">{t("search_results.sidebar.star_rating")}</h3>
              <div className="space-y-3">
                {[t("search_results.sidebar.star_5"), t("search_results.sidebar.star_4"), t("search_results.sidebar.star_3")].map((label) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant accent-primary" type="checkbox" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">{t("search_results.sidebar.amenities") || "Amenities"}</h3>
              <div className="space-y-3">
                {amenities.map((a) => (
                  <label key={a} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant accent-primary" type="checkbox" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/50">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">{t("search_results.sidebar.room_type")}</h3>
              <div className="space-y-3">
                {[t("search_results.sidebar.room_type_1"), t("search_results.sidebar.room_type_2"), t("search_results.sidebar.room_type_3")].map((roomType) => (
                  <label key={roomType} className="flex items-center gap-3 cursor-pointer group">
                    <input className="w-4 h-4 border-outline-variant accent-primary" name="room_type" type="radio" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{roomType}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">{t("search_results.header.title")}</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{t("search_results.header.results_found", { count: sorted.length })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">sort</span>
                <select
                  className="bg-transparent border-none text-sm font-bold text-on-surface focus:ring-0 cursor-pointer outline-none"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {sortOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

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
                        aria-label={t("search_results.card.toggle_favorite")}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: favorites.includes(room.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{room.locationDetail}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">{t("search_results.card.starting_from")}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-on-surface">${room.price.toLocaleString()}</span>
                        <span className="text-sm font-medium text-on-surface-variant">{t("search_results.card.per_night")}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to="/rooms" className="px-5 py-2.5 rounded-lg border border-primary text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/5 transition-colors">
                        {t("search_results.card.details")}
                      </Link>
                      <Link to="/booking" className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        {t("search_results.card.book_now")}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <nav className="flex items-center justify-center gap-2 pt-8" aria-label={t("search_results.pagination.label")}>
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

      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("footer.quick_links.home")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">{t("footer.quick_links.rooms")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("footer.quick_links.contact")}</Link>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.privacy_policy")}</a>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
