import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import background from "../../assets/images/background.png";

export default function FAQ() {
  const { t } = useTranslation("pub_translation");
  const tabDefs = useMemo(
    () => [
      { key: "all", label: t("faq_page.categories.all"), category: null },
      { key: "bookings", label: t("faq_page.categories.bookings"), category: "bookings" },
      { key: "payments", label: t("faq_page.categories.payments"), category: "payments" },
      { key: "rooms", label: t("faq_page.categories.rooms"), category: "rooms" },
      { key: "policies", label: t("faq_page.categories.policies"), category: "policies" },
    ],
    [t]
  );

  const [activeTab, setActiveTab] = useState("all");
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = t("faq_page.questions", { returnObjects: true });
  const currentCategory = tabDefs.find((tab) => tab.key === activeTab)?.category;
  const filtered = currentCategory ? faqs.filter((f) => f.category === currentCategory) : faqs;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("navigation.home")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/hotels">{t("navigation.hotels") || "Hotels"}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">{t("navigation.about")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("navigation.contact")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">{t("navigation.register")}</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">{t("navigation.login")}</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <section className="relative h-64 w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface z-10" />
            <img alt="Aerial view of a luxury coastal resort" className="w-full h-full object-cover scale-105" src={background} />
          </div>
          <div className="relative z-20 text-center px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">{t("faq_page.title")}</h1>
            <p className="text-white/85 font-medium">{t("faq_page.subtitle")}</p>
          </div>
        </section>

        <div className="sticky top-20 z-40 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/30 py-5">
          <div className="max-w-4xl mx-auto px-6 overflow-x-auto">
            <div className="flex gap-3 justify-start md:justify-center min-w-max">
              {tabDefs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setOpenFaq(-1);
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 ${activeTab === tab.key
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "border border-slate-200 dark:border-slate-700 text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-4">
            {filtered.map((faq, i) => (
              <div key={`${faq.category}-${i}`} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/30">
                <button
                  type="button"
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span className="font-bold text-base text-on-surface pr-4">{faq.question}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-on-surface-variant font-medium leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#137fec15_0%,transparent_60%)] pointer-events-none" />
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">{t("faq_page.still_have_questions.title")}</h2>
              <p className="text-slate-400 font-medium max-w-md">{t("faq_page.still_have_questions.message")}</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                {t("faq_page.still_have_questions.actions.contact_concierge")}
              </Link>
              <a
                href="tel:+18005558983"
                className="flex items-center justify-center gap-2 px-8 py-3 border border-slate-600 text-white font-bold rounded-lg hover:bg-white/5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                {t("faq_page.still_have_questions.actions.call_us")}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("footer.quick_links.home")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/hotels">{t("footer.quick_links.hotels") || "Hotels"}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("footer.quick_links.contact")}</Link>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.privacy_policy")}</a>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.terms_of_service")}</a>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
