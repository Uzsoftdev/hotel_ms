import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";

const HERO_IMG    = "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=90";
const LOCATION_IMG = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85";

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0);
  const { t } = useTranslation("pub_translation");

  const contactInfo = [
    {
      icon: "location_on",
      label: t("contact_page.headquarters.label"),
      value: t("contact_page.headquarters.address"),
    },
    {
      icon: "call",
      label: t("contact_page.global_concierge.label"),
      value: `${t("contact_page.global_concierge.phone")}\n${t("contact_page.global_concierge.availability")}`,
    },
    {
      icon: "mail",
      label: t("contact_page.direct_inquiry.label"),
      value: `${t("contact_page.direct_inquiry.email")}\n${t("contact_page.direct_inquiry.response_time")}`,
    },
  ];

  const faqs = t("about.faqs.items", { returnObjects: true });

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />

      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10 z-10" />
          <img alt="Luxury hotel grand lobby" className="w-full h-full object-cover scale-105" src={HERO_IMG} />
        </div>
        <div className="relative z-20 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">{t("contact_page.title")}</h1>
          <p className="text-white/85 text-lg font-medium max-w-xl mx-auto">
            {t("contact_page.subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-6">
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("contact_page.contact_intelligence")}</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">{t("contact_page.global_presence")}</h2>
            </div>
            {contactInfo.map((item) => (
              <div key={item.label} className="group p-8 rounded-xl bg-surface-container-lowest shadow-lg hover:shadow-2xl transition-all border border-outline-variant/30 flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{item.label}</h3>
                  <p className="text-base font-semibold text-on-surface whitespace-pre-line">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 pt-2">
              <a className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
              <a className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">forum</span>
              </a>
              <a className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-2xl p-10 border border-outline-variant/30">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("contact_page.form.full_name")}</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface placeholder:text-slate-300 outline-none" placeholder={t("contact_page.form.full_name_placeholder")} type="text" />
                </div>
                <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("contact_page.form.email")}</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface placeholder:text-slate-300 outline-none" placeholder={t("contact_page.form.email_placeholder")} type="email" />
                </div>
              </div>

              <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("contact_page.form.subject")}</label>
                <select className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface cursor-pointer outline-none">
                  <option>{t("contact_page.form.subject_options.general")}</option>
                  <option>{t("contact_page.form.subject_options.booking")}</option>
                  <option>{t("contact_page.form.subject_options.partnership")}</option>
                  <option>{t("contact_page.form.subject_options.membership")}</option>
                  <option>{t("contact_page.form.subject_options.feedback")}</option>
                </select>
              </div>

              <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("contact_page.form.message")}</label>
                <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface placeholder:text-slate-300 resize-none outline-none" placeholder={t("contact_page.form.message_placeholder")} rows={4} />
              </div>

              <button className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]" type="submit">
                {t("contact_page.form.send_message")}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-80 group">
          <img src={LOCATION_IMG} alt="Miami Beach aerial view"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-lg leading-tight">1 Ocean Drive, Miami Beach</p>
              <p className="text-white/70 text-sm font-medium mt-1">South Beach · FL 33139 · United States</p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=1+Ocean+Drive+Miami+Beach+FL+33139"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-primary text-base">map</span>
              Open in Maps
            </a>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24 border-t border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("contact_page.concierge_wisdom")}</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">{t("contact_page.frequently_asked")}</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-6 text-left font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  type="button"
                >
                  {faq.question}
                  <span className={`material-symbols-outlined text-primary transition-transform ${openFaq === i ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-on-surface-variant font-medium leading-relaxed">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("footer.quick_links.home")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/hotels">{t("footer.quick_links.hotels") || "Hotels"}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/about">{t("navigation.about")}</Link>
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
