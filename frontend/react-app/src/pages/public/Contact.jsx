import { useState } from "react";
import { Link } from "react-router-dom";
import background from "../../assets/images/contact_us.png";

const contactInfo = [
  { icon: "location_on", label: "Headquarters", value: "1200 Azure Plaza, Coastal Ridge\nMonte Carlo, 98000" },
  { icon: "call", label: "Global Concierge", value: "+1 (800) 555-AZURE\nAvailable 24/7" },
  { icon: "mail", label: "Direct Inquiry", value: "concierge@azurehorizon.com\nResponse within 2 hours" },
];

const faqs = [
  { q: "Can I arrange a private jet transfer?", a: "Absolutely. Our Global Concierge team coordinates with private aviation partners to ensure your arrival is effortless and discreet." },
  { q: "What is the Azure Horizon membership?", a: "Horizon Circle is an invitation-only program providing exclusive access to off-market villas, private islands, and priority reservations." },
  { q: "Are pet-friendly options available?", a: 'Many properties offer specialized "Canine Concierge" services including gourmet menus and bespoke bedding. Please inquire during booking.' },
];

export default function Contact() {
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
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
            <Link className="text-sm font-semibold text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">Register</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface z-10" />
          <img alt="Luxury hotel lobby with marble floors and ambient lighting" className="w-full h-full object-cover scale-105" src={background} />
        </div>
        <div className="relative z-20 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">Get in Touch</h1>
          <p className="text-white/85 text-lg font-medium max-w-xl mx-auto">
            We are here to craft your perfect escape. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left: Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Contact Intelligence</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mt-2">Our Global Presence</h2>
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

            {/* Social Links */}
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

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-2xl p-10 border border-outline-variant/30">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface placeholder:text-slate-300 outline-none" placeholder="John Doe" type="text" />
                </div>
                <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface placeholder:text-slate-300 outline-none" placeholder="john@example.com" type="email" />
                </div>
              </div>

              <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</label>
                <select className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface cursor-pointer outline-none">
                  <option>General Inquiry</option>
                  <option>Booking Support</option>
                  <option>Corporate Partnership</option>
                  <option>Private Membership</option>
                  <option>Feedback</option>
                </select>
              </div>

              <div className="space-y-2 border-b border-outline-variant/50 focus-within:border-primary transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Your Message</label>
                <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface placeholder:text-slate-300 resize-none outline-none" placeholder="How can we elevate your journey?" rows={4} />
              </div>

              <button className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]" type="submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl h-64 flex flex-col items-center justify-center shadow-lg border border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-primary">location_on</span>
          <p className="mt-3 text-sm font-semibold text-on-surface-variant">Interactive map coming soon</p>
          <p className="text-xs text-on-surface-variant/60 mt-1">Azure Horizon • Monte Carlo</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-container-low py-24 border-t border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Concierge Wisdom</span>
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
                  <div className="px-6 pb-6 text-sm text-on-surface-variant font-medium leading-relaxed">{faq.a}</div>
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
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
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
