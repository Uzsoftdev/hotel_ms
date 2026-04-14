import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import parisImage from "../../assets/images/paris_1.png";
import baliImage from "../../assets/images/bali_1.png";
import newyorkImage from "../../assets/images/new_york_1.png";
import background from "../../assets/images/background.png";
import { useTranslation } from "react-i18next";

const languageItems = [
  { code: "en", flag: "🇺🇸" },
  { code: "es", flag: "🇪🇸" },
  { code: "fr", flag: "🇫🇷" },
  { code: "de", flag: "🇩🇪" },
  { code: "zh", flag: "🇨🇳" },
  { code: "ja", flag: "🇯🇵" },
  { code: "ko", flag: "🇰🇷" },
  { code: "it", flag: "🇮🇹" },
  { code: "pt", flag: "🇵🇹" },
  { code: "ar", flag: "🇸🇦" },
  { code: "ru", flag: "🇷🇺" },
];

const destinationImages = [parisImage, baliImage, newyorkImage];

export default function Home() {
  const { t, i18n } = useTranslation("pub_translation");
  const [language, setLanguage] = useState(i18n.language || "en");
  const [location, setLocation] = useState("");
  const [dateLabel, setDateLabel] = useState(t("home.search.select_dates"));
  const translatedDestinations = useMemo(() => {
    const items = t("home.destinations.items", { returnObjects: true });
    if (!Array.isArray(items)) {
      return [];
    }
    return items.map((item, index) => ({
      ...item,
      image: destinationImages[index],
    }));
  }, [t, i18n.language]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    const syncLanguage = (lng) => setLanguage(lng);
    i18n.on("languageChanged", syncLanguage);
    return () => i18n.off("languageChanged", syncLanguage);
  }, [i18n]);

  useEffect(() => {
    setDateLabel(t("home.search.select_dates"));
  }, [language, t]);

  useEffect(() => {
    if (location.trim() === "") {
      setFilteredDestinations(translatedDestinations);
    } else {
      const filtered = translatedDestinations.filter((dest) =>
        dest.name.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredDestinations(filtered);
    }
  }, [location, translatedDestinations]);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</h1>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#search-experience">{t("navigation.find_hotel")}</a>
            <Link className="text-sm font-semibold hover:text-primary transition-colors" to="/login">{t("navigation.manage_bookings")}</Link>
            <Link className="text-sm font-semibold hover:text-primary transition-colors" to="/contact">
              {t("navigation.partner_with_us")}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                aria-label={t("navigation.select_language")}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">language</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 mb-1">{t("navigation.select_language")}</div>
                {languageItems.map((item) => (
                  <button
                    className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${language === item.code ? "font-semibold text-primary" : "text-slate-700 dark:text-slate-200"}`}
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      localStorage.setItem("app_language", item.code);
                    }}
                    type="button"
                  >
                    <span className="text-lg">{item.flag}</span>
                    {t(`languages.${item.code}`)}
                  </button>
                ))}
              </div>
            </div>

            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-lg text-sm font-bold transition-all" to="/register">
              {t("navigation.register")}
            </Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">
              {t("navigation.login")}
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative h-[640px] w-full flex items-center justify-center overflow-hidden" id="search-experience">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background-light dark:to-background-dark z-10" />
          <img alt="Luxury resort exterior by the ocean" className="w-full h-full object-cover scale-110 blur-sm" src={background} />
        </div>

        <div className="relative z-20 max-w-5xl w-full px-6 text-center">
          <h2 className="text-white text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">{t("home.hero.title")}</h2>
          <p className="text-white/90 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">{t("home.hero.subtitle")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
        <form
          className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-2xl flex flex-col md:flex-row items-stretch gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Location */}
          <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-slate-400 mr-3">location_on</span>
            <div className="text-left w-full">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider" htmlFor="search-location">
                {t("home.search.location")}
              </label>
              <input
                className="w-full border-none p-0 focus:ring-0 bg-transparent text-sm font-semibold placeholder:text-slate-400 text-slate-900 dark:text-white outline-none"
                id="search-location"
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("home.search.location_placeholder")}
                type="text"
                value={location}
              />
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-slate-400 mr-3">calendar_today</span>
            <div className="text-left w-full">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t("home.search.check_in_out")}
              </label>
              <button
                className="w-full text-left text-sm font-semibold text-slate-400 truncate"
                onClick={() =>
                  setDateLabel(
                    dateLabel === t("home.search.select_dates")
                      ? t("home.search.sample_date_range")
                      : t("home.search.select_dates")
                  )
                }
                type="button"
              >
                {dateLabel}
              </button>
            </div>
          </div>

          {/* Guests */}
          <div className="flex-1 flex items-center px-4 py-3">
            <span className="material-symbols-outlined text-slate-400 mr-3">group</span>
            <div className="text-left w-full">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t("home.search.guests")}
              </label>
              <button
                className="w-full text-left text-sm font-semibold text-slate-400"
                type="button"
              >
                {t("home.search.add_guests")}
              </button>
            </div>
          </div>

          {/* Search */}
          <button
            className="bg-primary hover:bg-primary/90 text-white md:w-40 py-4 md:py-0 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
            type="submit"
          >
            <span className="material-symbols-outlined">search</span>
            <span>{t("home.search.search")}</span>
          </button>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24" id="destinations-section">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{t("home.destinations.title")}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t("home.destinations.subtitle")}</p>
          </div>
          <a className="text-primary font-bold text-sm flex items-center gap-1 hover:underline" href="#destinations-section">
            {t("home.destinations.view_all")} <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <div key={destination.name} className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
              <img alt={destination.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={destination.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h4 className="text-white text-2xl font-bold mb-1">{destination.name}</h4>
                <p className="text-white/80 text-sm">{destination.detail} • {destination.hotels}</p>
              </div>
            </div>
          ))}
        </div>
        {filteredDestinations.length === 0 && (
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            {t("home.search.no_match")}
          </p>
        )}
      </section>

      <section class="bg-slate-50 dark:bg-slate-900/50 py-24 border-t border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-16">
      <div class="col-span-1 md:col-span-1">
      <div class="flex items-center gap-2 mb-6">
      <span class="material-symbols-outlined text-primary text-3xl">apartment</span>
        <h4 class="text-xl font-bold text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</h4>
      </div>
      <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                  {t("home.footer.about_text")}
                      </p>
      <div class="flex items-center gap-4">
      <a class="text-slate-400 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">public</span></a>
      <a class="text-slate-400 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">forum</span></a>
      <a class="text-slate-400 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">share</span></a>
      </div>
      </div>
      <div class="col-span-1">
      <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">{t("home.footer.contact.title")}</h4>
      <ul class="space-y-4">
      <li class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">mail</span>
      <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">{t("home.footer.contact.email_label")}</p>
      <p class="text-sm text-slate-600 dark:text-slate-400">{t("contact_page.direct_inquiry.email")}</p>
      </div>
      </li>
      <li class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">call</span>
      <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">{t("home.footer.contact.call_label")}</p>
      <p class="text-sm text-slate-600 dark:text-slate-400">{t("home.footer.contact.call_value")}</p>
      </div>
      </li>
      <li class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">location_on</span>
      <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">{t("contact_page.headquarters.label")}</p>
      <p class="text-sm text-slate-600 dark:text-slate-400">{t("home.footer.contact.hq_value")}</p>
      </div>
      </li>
      </ul>
      </div>
      <div class="col-span-1">
      <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">{t("footer.quick_links.title")}</h4>
      <ul class="grid grid-cols-1 gap-3">
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.privacy_policy")}</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.terms_of_service")}</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.help_center")}</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("home.footer.careers")}</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.our_story")}</a></li>
      </ul>
      </div>
      </div>
      <div class="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
      <p class="text-sm text-slate-400">{t("footer.copyright")}</p>
      </div>
      </div>
      </section>
    </div>
  );
}
