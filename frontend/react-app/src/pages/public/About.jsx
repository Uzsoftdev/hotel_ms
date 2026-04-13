import { useState } from "react";
import { Link } from "react-router-dom";
import background from "../../assets/images/about_us.png";

const values = [
  { icon: "favorite", title: "Guest First", desc: "Every decision we make starts with the guest experience in mind." },
  { icon: "verified", title: "Uncompromising Quality", desc: "We partner only with properties that meet our rigorous luxury standards." },
  { icon: "public", title: "Global Reach", desc: "500+ properties across 120+ countries, always close to where you want to be." },
];

const milestones = [
  { year: "2018", text: "Azure Horizon founded in San Francisco with a vision to redefine luxury travel." },
  { year: "2020", text: "Expanded to 50 partner hotels across Europe, Asia, and the Americas." },
  { year: "2022", text: "Launched our digital booking platform, serving over 500,000 guests." },
  { year: "2024", text: "Reached 500+ properties in 120+ countries with 2M+ happy guests." },
];

const team = [
  { name: "Sofia Laurent", title: "Chief Executive Officer" },
  { name: "Marcus Chen", title: "Head of Hospitality" },
  { name: "Amara Osei", title: "Director of Partnerships" },
];

const stats = [
  { value: "500+", label: "Hotels" },
  { value: "120+", label: "Countries" },
  { value: "2M+", label: "Guests" },
  { value: "4.9★", label: "Rating" },
];

const faqs = [
  { q: "Can I arrange a private jet transfer?", a: "Absolutely. Our Global Concierge team coordinates with private aviation partners to ensure your arrival is effortless and discreet." },
  { q: "What is the Azure Horizon membership?", a: "Horizon Circle is an invitation-only program providing exclusive access to off-market villas, private islands, and priority reservations." },
  { q: "Are pet-friendly options available?", a: "Many properties offer specialized Canine Concierge services including gourmet menus and bespoke bedding. Please inquire during booking." },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Azure Horizon</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-sm font-semibold text-primary transition-colors" to="/about">About</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">Register</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface z-10" />
          <img alt="Luxury hotel lobby with marble floors and ambient lighting" className="w-full h-full object-cover scale-105" src={background} />
        </div>
        <div className="relative z-20 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">Our Story</h1>
          <p className="text-white/85 text-lg font-medium max-w-xl mx-auto">
            Born from a passion for travel, built to deliver extraordinary experiences worldwide.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 -mt-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-bright p-8 rounded-xl shadow-2xl border border-outline-variant/50 flex flex-col items-center text-center">
              <span className="text-4xl font-extrabold text-primary tracking-tighter mb-1">{s.value}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">What We Stand For</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">Mission & Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v) => (
            <div key={v.title} className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg hover:shadow-2xl transition-all text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">{v.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">{v.title}</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-surface-container-low py-24 border-t border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">How We Got Here</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">Our Journey</h2>
          </div>
          <div className="relative border-l-2 border-primary/30 pl-10 space-y-10">
            {milestones.map((m) => (
              <div key={m.year} className="relative">
                <div className="absolute -left-[2.85rem] top-1 w-5 h-5 rounded-full bg-primary border-4 border-surface-container-low" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{m.year}</span>
                <p className="mt-1 text-on-surface font-semibold leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">The People Behind It</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">Meet the Team</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg text-center hover:shadow-2xl transition-all">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">account_circle</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">{member.name}</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-1">{member.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-container-low py-24 border-t border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Common Questions</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">Frequently Asked</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-6 text-left font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  type="button"
                >
                  {faq.q}
                  <span className={`material-symbols-outlined text-primary transition-transform ${openFaq === i ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-on-surface-variant font-medium leading-relaxed text-sm">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">Azure Horizon</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</a>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            © 2024 Azure Horizon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
