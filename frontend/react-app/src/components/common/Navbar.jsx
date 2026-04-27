import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import UserProfileMenu from "./UserProfileMenu";

const LANGUAGES = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "zh", flag: "🇨🇳", name: "中文" },
  { code: "ja", flag: "🇯🇵", name: "日本語" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
];

export default function Navbar({ transparent = false }) {
  const { t, i18n } = useTranslation("pub_translation");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isTransparent = transparent && !scrolled;

  const navLinks = [
    { to: "/", label: t("navigation.home") || "Home" },
    { to: "/rooms", label: t("navigation.rooms") || "Rooms" },
    { to: "/about", label: t("navigation.about") || "About" },
    { to: "/contact", label: t("navigation.contact") || "Contact" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6" style={{ height: "72px" }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isTransparent ? "bg-white/20" : "bg-primary/10"}`}>
              <span className={`material-symbols-outlined text-lg ${isTransparent ? "text-white" : "text-primary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
            </div>
            <span className={`text-xl font-extrabold tracking-tight ${isTransparent ? "text-white" : "text-slate-900"}`}>
              Azure <span className={isTransparent ? "text-white/70" : "text-primary"}>Horizon</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? isTransparent ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                    : isTransparent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`
              }>{label}</NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isTransparent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-base">language</span>
                <span className="text-xs uppercase tracking-widest">{i18n.language?.slice(0, 2) || "EN"}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 animate-slide-down z-50">
                  {LANGUAGES.map(({ code, flag, name }) => (
                    <button key={code} onClick={() => { i18n.changeLanguage(code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${i18n.language === code ? "text-primary font-bold bg-primary/5" : "text-slate-700 hover:bg-slate-50"}`}>
                      <span>{flag}</span>{name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <UserProfileMenu />
            ) : (
              <>
                <Link to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isTransparent ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}>
                  {t("navigation.login") || "Sign in"}
                </Link>
                <Link to="/register"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md ${
                    isTransparent
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  }`}>
                  {t("navigation.register") || "Get started"}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg ${isTransparent ? "text-white" : "text-slate-700"}`}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-1 animate-slide-down">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-2">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold text-center">My Account</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full border border-slate-200 text-slate-700 py-3 rounded-lg text-sm font-bold text-center">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold text-center">Get started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer when not transparent */}
      {!transparent && <div style={{ height: "72px" }} />}
    </>
  );
}
