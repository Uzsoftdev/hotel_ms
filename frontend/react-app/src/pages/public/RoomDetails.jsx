import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import parisImage from "../../assets/images/paris_1.png";

const highlightMeta = [
  { icon: "straighten", key: "size" },
  { icon: "king_bed", key: "bedding" },
  { icon: "groups", key: "capacity" },
  { icon: "balcony", key: "outdoor" },
];

export default function RoomDetails() {
  const { t } = useTranslation("pub_translation");

  const highlights = highlightMeta.map((item) => ({
    ...item,
    label: t(`room_details.common.${item.key}`),
    value: t(`room_details.highlights.${item.key}`),
  }));

  const amenities = t("room_details.amenities", { returnObjects: true });
  const reviews = t("room_details.reviews", { returnObjects: true });

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("navigation.home")}</Link>
            <Link className="text-sm font-semibold text-primary transition-colors" to="/rooms">{t("navigation.rooms")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">{t("navigation.about")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("navigation.contact")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">{t("navigation.register")}</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">{t("navigation.login")}</Link>
          </div>
        </div>
      </nav>

      <section className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img
          alt="The Celestial Terrace Suite with panoramic Paris skyline views"
          className="w-full h-full object-cover scale-105"
          src={parisImage}
        />
        <div className="absolute bottom-0 left-0 w-full px-8 md:px-12 pb-10 z-20 flex justify-between items-end">
          <div className="space-y-3">
            <span className="bg-primary/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {t("room_details.room_type")}
            </span>
            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
              {t("room_details.room_name")}
            </h1>
          </div>
          <Link
            to="/booking"
            className="hidden md:flex bg-primary text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-2xl shadow-primary/30"
          >
            {t("room_details.book_now")}
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-10">
          <Link className="hover:text-primary transition-colors" to="/rooms">{t("navigation.rooms")}</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface">{t("room_details.room_name")}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-14">
            <div className="space-y-5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-on-surface">{t("room_details.rating_text")}</span>
                <span className="text-outline-variant">|</span>
                <span className="text-sm font-medium text-on-surface-variant">{t("room_details.verified_reviews")}</span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{t("room_details.location_detail")}</span>
                </div>
              </div>
              <p className="text-base leading-relaxed text-on-surface-variant font-medium">
                {t("room_details.description")}
              </p>
            </div>

            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">{t("room_details.room_highlights")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {highlights.map((h) => (
                  <div key={h.key} className="p-6 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">{h.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{h.label}</p>
                      <p className="font-bold text-on-surface mt-0.5">{h.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">{t("room_details.luxury_amenities")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                {amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span className="text-sm font-medium text-on-surface-variant">{a}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">{t("room_details.guest_reviews")}</h2>
                <button type="button" className="text-primary font-bold text-sm hover:underline">{t("room_details.view_all_reviews")}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((r, idx) => (
                  <div key={r.author} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-lg space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-primary">{idx === 0 ? "AS" : "JV"}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{r.author}</p>
                        <p className="text-xs text-on-surface-variant font-medium">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm italic text-on-surface-variant leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 p-6 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("room_details.booking_widget.starting_from")}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-on-surface">$2,450</span>
                  <span className="text-on-surface-variant font-medium text-sm">{t("room_details.booking_widget.per_night")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 border border-outline-variant rounded-lg overflow-hidden">
                <div className="p-4 border-r border-outline-variant">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("room_details.booking_widget.check_in")}</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-on-surface outline-none" type="date" />
                </div>
                <div className="p-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("room_details.booking_widget.check_out")}</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-on-surface outline-none" type="date" />
                </div>
              </div>

              <div className="p-4 border border-outline-variant rounded-lg">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("room_details.booking_widget.guests")}</label>
                <select className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-on-surface outline-none cursor-pointer" defaultValue={t("room_details.booking_widget.guest_options.3")}>
                  <option>{t("room_details.booking_widget.guest_options.1")}</option>
                  <option>{t("room_details.booking_widget.guest_options.2")}</option>
                  <option>{t("room_details.booking_widget.guest_options.3")}</option>
                  <option>{t("room_details.booking_widget.guest_options.4")}</option>
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-outline-variant/30">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">{t("room_details.booking_widget.price_line")}</span>
                  <span className="font-bold text-on-surface">$12,250</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">{t("room_details.booking_widget.service_fee")}</span>
                  <span className="font-bold text-on-surface">$420</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">{t("room_details.booking_widget.luxury_tax")}</span>
                  <span className="font-bold text-on-surface">$1,520</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-outline-variant/30 items-baseline">
                  <span className="font-extrabold text-on-surface">{t("room_details.booking_widget.total")}</span>
                  <span className="text-2xl font-extrabold text-primary">$14,190</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/booking"
                  className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {t("room_details.booking_widget.book_now")}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <button
                  type="button"
                  className="w-full border border-primary text-primary py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  {t("room_details.booking_widget.add_to_wishlist")}
                </button>
              </div>

              <p className="text-center text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs align-middle mr-1">lock</span>
                {t("room_details.booking_widget.secure_booking")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 mt-10 border-t border-slate-200 dark:border-slate-800">
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
