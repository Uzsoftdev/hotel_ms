import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import parisImage from "../../assets/images/paris_1.png";
import baliImage from "../../assets/images/bali_1.png";
import newyorkImage from "../../assets/images/new_york_1.png";
import background from "../../assets/images/background.png";


const destinations = [
  {
    name: "Paris",
    detail: "The City of Light",
    hotels: "420+ Hotels",
    image: parisImage,
  },
  {
    name: "Bali",
    detail: "Tropical Paradise",
    hotels: "850+ Hotels",
    image: baliImage,
  },
  {
    name: "New York",
    detail: "The Big Apple",
    hotels: "630+ Hotels",
    image: newyorkImage,
  },
];

const translations = {
  en: {
    navFindHotel: "Find a Hotel",
    navManageBookings: "Manage Bookings",
    navPartner: "Partner with Us",
    navSelectLanguage: "Select Language",
    navRegister: "Register",
    navLogin: "Login",
    heroTitle: "Luxury Awaits Your Arrival",
    heroSubtitle:
      "Experience world-class hospitality in the heart of the most prestigious global destinations.",
    destinationsTitle: "Popular Destinations",
    destinationsSubtitle: "Discover top-rated hotels and unique experiences worldwide.",
    viewAll: "View All Destinations",
    footerQuickLinks: "Quick Links",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    helpCenter: "Help Center",
    ourStory: "Our Story",
  },
  es: {
    navFindHotel: "Buscar hotel",
    navManageBookings: "Gestionar reservas",
    navPartner: "Asociate con nosotros",
    navSelectLanguage: "Seleccionar idioma",
    navRegister: "Registrarse",
    navLogin: "Iniciar sesion",
    heroTitle: "El lujo te espera",
    heroSubtitle:
      "Disfruta hospitalidad de clase mundial en los destinos globales mas prestigiosos.",
    destinationsTitle: "Destinos populares",
    destinationsSubtitle:
      "Descubre hoteles mejor valorados y experiencias unicas en todo el mundo.",
    viewAll: "Ver todos los destinos",
    footerQuickLinks: "Enlaces rapidos",
    privacyPolicy: "Politica de privacidad",
    terms: "Terminos del servicio",
    helpCenter: "Centro de ayuda",
    ourStory: "Nuestra historia",
  },
  fr: {
    navFindHotel: "Trouver un hotel",
    navManageBookings: "Gerer les reservations",
    navPartner: "Devenir partenaire",
    navSelectLanguage: "Choisir la langue",
    navRegister: "S'inscrire",
    navLogin: "Connexion",
  },
  de: {
    navFindHotel: "Hotel finden",
    navManageBookings: "Buchungen verwalten",
    navPartner: "Partner werden",
    navSelectLanguage: "Sprache auswahlen",
    navRegister: "Registrieren",
    navLogin: "Anmelden",
  },
  zh: {
    navFindHotel: "查找酒店",
    navManageBookings: "管理预订",
    navPartner: "成为合作伙伴",
    navSelectLanguage: "选择语言",
    navRegister: "注册",
    navLogin: "登录",
  },
  ja: {
    navFindHotel: "ホテルを探す",
    navManageBookings: "予約管理",
    navPartner: "提携する",
    navSelectLanguage: "言語を選択",
    navRegister: "登録",
    navLogin: "ログイン",
  },
  ko: {
    navFindHotel: "호텔 찾기",
    navManageBookings: "예약 관리",
    navPartner: "파트너 등록",
    navSelectLanguage: "언어 선택",
    navRegister: "회원가입",
    navLogin: "로그인",
  },
  it: {
    navFindHotel: "Trova un hotel",
    navManageBookings: "Gestisci prenotazioni",
    navPartner: "Diventa partner",
    navSelectLanguage: "Seleziona lingua",
    navRegister: "Registrati",
    navLogin: "Accedi",
  },
  pt: {
    navFindHotel: "Encontrar hotel",
    navManageBookings: "Gerenciar reservas",
    navPartner: "Seja parceiro",
    navSelectLanguage: "Selecionar idioma",
    navRegister: "Cadastrar",
    navLogin: "Entrar",
  },
  ar: {
    navFindHotel: "ابحث عن فندق",
    navManageBookings: "إدارة الحجوزات",
    navPartner: "كن شريكا",
    navSelectLanguage: "اختر اللغة",
    navRegister: "تسجيل",
    navLogin: "دخول",
  },
};

const languageItems = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

export default function Home() {
  const [language, setLanguage] = useState(() => localStorage.getItem("preferredLanguage") || "en");
  const [location, setLocation] = useState("");
  const [dateLabel, setDateLabel] = useState("Select Dates");
  const [guestsLabel, setGuestsLabel] = useState("2 Adults, 0 Children");
  const t = { ...translations.en, ...(translations[language] || {}) };
  const filteredDestinations = destinations.filter((destination) => {
    if (!location.trim()) return true;
    const q = location.trim().toLowerCase();
    return [destination.name, destination.detail, destination.hotels].some((v) =>
      v.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Azure Horizon</h1>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#search-experience">{t.navFindHotel}</a>
            <Link className="text-sm font-semibold hover:text-primary transition-colors" to="/login">{t.navManageBookings}</Link>
            <Link className="text-sm font-semibold hover:text-primary transition-colors" to="/contact">
              {t.navPartner}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                aria-label={t.navSelectLanguage}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">language</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 mb-1">{t.navSelectLanguage}</div>
                {languageItems.map((item) => (
                  <button
                    className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${language === item.code ? "font-semibold text-primary" : "text-slate-700 dark:text-slate-200"}`}
                    key={item.code}
                    onClick={() => setLanguage(item.code)}
                    type="button"
                  >
                    <span className="text-lg">{item.flag}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-lg text-sm font-bold transition-all" to="/register">
              {t.navRegister}
            </Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">
              {t.navLogin}
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
          <h2 className="text-white text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">{t.heroTitle}</h2>
          <p className="text-white/90 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">{t.heroSubtitle}</p>
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
                Location
              </label>
              <input
                className="w-full border-none p-0 focus:ring-0 bg-transparent text-sm font-semibold placeholder:text-slate-400 text-slate-900 dark:text-white outline-none"
                id="search-location"
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you going?"
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
                Check-in / Check-out
              </label>
              <button
                className="w-full text-left text-sm font-semibold text-slate-400 truncate"
                onClick={() => setDateLabel(dateLabel === "Select Dates" ? "Apr 20 – Apr 25" : "Select Dates")}
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
                Guests
              </label>
              <button
                className="w-full text-left text-sm font-semibold text-slate-400"
                type="button"
              >
                {guestsLabel}
              </button>
            </div>
          </div>

          {/* Search */}
          <button
            className="bg-primary hover:bg-primary/90 text-white md:w-40 py-4 md:py-0 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
            type="submit"
          >
            <span className="material-symbols-outlined">search</span>
            <span>Search</span>
          </button>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24" id="destinations-section">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{t.destinationsTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t.destinationsSubtitle}</p>
          </div>
          <a className="text-primary font-bold text-sm flex items-center gap-1 hover:underline" href="#destinations-section">
            {t.viewAll} <span class="material-symbols-outlined text-sm">arrow_forward</span>
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
            No destinations match your search.
          </p>
        )}
      </section>

      <section class="bg-slate-50 dark:bg-slate-900/50 py-24 border-t border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-16">
      <div class="col-span-1 md:col-span-1">
      <div class="flex items-center gap-2 mb-6">
      <span class="material-symbols-outlined text-primary text-3xl">apartment</span>
      <h4 class="text-xl font-bold text-slate-900 dark:text-white">Azure Horizon</h4>
      </div>
      <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                          Our mission is to empower travelers with seamless booking experiences and provide hotel owners with the world's most robust management tools. We believe everyone deserves a touch of luxury on their journey.
                      </p>
      <div class="flex items-center gap-4">
      <a class="text-slate-400 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">public</span></a>
      <a class="text-slate-400 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">forum</span></a>
      <a class="text-slate-400 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">share</span></a>
      </div>
      </div>
      <div class="col-span-1">
      <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
      <ul class="space-y-4">
      <li class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">mail</span>
      <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">Email Us</p>
      <p class="text-sm text-slate-600 dark:text-slate-400">concierge@azurehorizon.com</p>
      </div>
      </li>
      <li class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">call</span>
      <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">Call Anytime</p>
      <p class="text-sm text-slate-600 dark:text-slate-400">+1 (800) LUX-STAY</p>
      </div>
      </li>
      <li class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">location_on</span>
      <div>
      <p class="text-sm font-bold text-slate-900 dark:text-white">Headquarters</p>
      <p class="text-sm text-slate-600 dark:text-slate-400">123 Luxury Way, San Francisco, CA</p>
      </div>
      </li>
      </ul>
      </div>
      <div class="col-span-1">
      <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
      <ul class="grid grid-cols-1 gap-3">
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Help Center</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Careers</a></li>
      <li><a class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Our Story</a></li>
      </ul>
      </div>
      </div>
      <div class="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
      <p class="text-sm text-slate-400">© 2024 Azure Horizon Luxury Hotels &amp; Resorts. All rights reserved.</p>
      </div>
      </div>
      </section>
    </div>
  );
}
