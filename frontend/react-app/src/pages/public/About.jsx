import { useState } from "react";
import { Link } from "react-router-dom";
import background from "../../assets/images/about_us.png";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";

const valueIcons = ["favorite", "verified", "public"];

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);
  const { t } = useTranslation("pub_translation");
  const values = t("about.mission.items", { returnObjects: true });
  const milestones = t("about.history.timeline", { returnObjects: true });
  const team = t("about.team.members", { returnObjects: true });
  const faqs = t("about.faqs.items", { returnObjects: true });
  const stats = [
    t("about.stats.hotels"),
    t("about.stats.countries"),
    t("about.stats.guests"),
    t("about.stats.rating"),
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface z-10" />
          <img alt="Luxury hotel lobby with marble floors and ambient lighting" className="w-full h-full object-cover scale-105" src={background} />
        </div>
        <div className="relative z-20 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">{t("about.hero.title")}</h1>
          <p className="text-white/85 text-lg font-medium max-w-xl mx-auto">
            {t("about.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 -mt-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface-bright p-8 rounded-xl shadow-2xl border border-outline-variant/50 flex flex-col items-center text-center">
              <span className="text-2xl md:text-3xl font-extrabold text-primary tracking-tighter">{stat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("about.mission.title")}</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">{t("about.mission.subtitle")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={v.title} className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg hover:shadow-2xl transition-all text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">{valueIcons[i]}</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">{v.title}</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-surface-container-low py-24 border-t border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("about.history.title")}</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">{t("about.history.title")}</h2>
          </div>
          <div className="relative border-l-2 border-primary/30 pl-10 space-y-10">
            {milestones.map((m) => (
              <div key={m.year} className="relative">
                <div className="absolute -left-[2.85rem] top-1 w-5 h-5 rounded-full bg-primary border-4 border-surface-container-low" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{m.year}</span>
                <p className="mt-1 text-on-surface font-semibold leading-relaxed">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("about.team.title")}</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">{t("about.team.title")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg text-center hover:shadow-2xl transition-all">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-primary text-4xl">account_circle</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-on-surface">{member.name}</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-1 mb-4">{member.role}</p>
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-container-low py-24 border-t border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("about.faqs.title")}</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">{t("about.faqs.title")}</h2>
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
                  <div className="px-6 pb-6 text-on-surface-variant font-medium leading-relaxed text-sm">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("footer.quick_links.home")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">{t("footer.quick_links.rooms")}</Link>
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
