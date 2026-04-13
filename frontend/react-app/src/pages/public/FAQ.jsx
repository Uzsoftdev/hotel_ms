import { useState } from "react";
import { Link } from "react-router-dom";
import background from "../../assets/images/background.png";

const TABS = ["All", "Bookings", "Payments", "Rooms", "Policies"];

const faqs = [
  { category: "Bookings", q: "How do I modify my booking?", a: "Reservations can be modified through your Azure Horizon account under 'My Stays'. Changes are subject to availability and the rate conditions of your original booking." },
  { category: "Bookings", q: "What is the cancellation policy?", a: "Cancellation policies vary by rate. Flexible rates allow cancellation up to 48 hours before arrival. Non-refundable rates cannot be cancelled or modified after booking." },
  { category: "Bookings", q: "Can I book for someone else?", a: "Yes. During checkout, you can enter a different guest name. The primary cardholder must still complete the payment, and a valid ID will be required at check-in." },
  { category: "Payments", q: "What payment methods are accepted?", a: "We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and secure bank transfers for prepaid reservations." },
  { category: "Payments", q: "When is payment charged?", a: "For flexible rates, payment is taken at check-in. For non-refundable rates, the full amount is charged at the time of booking." },
  { category: "Payments", q: "Is my payment secure?", a: "All transactions are encrypted with 256-bit SSL and processed through PCI-DSS compliant payment gateways. Your card details are never stored on our servers." },
  { category: "Rooms", q: "What amenities are included?", a: "All rooms include complimentary high-speed WiFi, daily housekeeping, access to the fitness center, and 24/7 concierge service. Suite guests receive additional benefits including butler service." },
  { category: "Rooms", q: "Are pets allowed?", a: 'Many of our properties are pet-friendly. Please check the specific property details or contact our concierge for our "Paws & Palm" pet packages.' },
  { category: "Policies", q: "What is the check-in time?", a: "Standard check-in begins at 3:00 PM local time. Early check-in from 12:00 PM may be available upon request and subject to availability. Late check-out until 2:00 PM can also be arranged." },
  { category: "Policies", q: "Is smoking allowed?", a: "All Azure Horizon properties are entirely non-smoking indoors. Designated outdoor smoking areas are available. A deep-cleaning fee applies if smoking occurs in guest rooms." },
];

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  const filtered = activeTab === "All" ? faqs : faqs.filter((f) => f.category === activeTab);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Azure Horizon</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">Register</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative h-64 w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-surface z-10" />
            <img alt="Aerial view of a luxury coastal resort" className="w-full h-full object-cover scale-105" src={background} />
          </div>
          <div className="relative z-20 text-center px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">Help &amp; FAQ</h1>
            <p className="text-white/85 font-medium">Everything you need to know about Azure Horizon</p>
          </div>
        </section>

        {/* Category Tabs */}
        <div className="sticky top-20 z-40 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/30 py-5">
          <div className="max-w-4xl mx-auto px-6 overflow-x-auto">
            <div className="flex gap-3 justify-start md:justify-center min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setOpenFaq(-1); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 ${activeTab === tab
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "border border-slate-200 dark:border-slate-700 text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-4">
            {filtered.map((faq, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/30">
                <button
                  type="button"
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span className="font-bold text-base text-on-surface pr-4">{faq.q}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-on-surface-variant font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#137fec15_0%,transparent_60%)] pointer-events-none" />
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Still have questions?</h2>
              <p className="text-slate-400 font-medium max-w-md">Our concierge team is available 24/7 to help you curate your perfect escape.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                Contact Concierge
              </Link>
              <a
                href="tel:+18005558983"
                className="flex items-center justify-center gap-2 px-8 py-3 border border-slate-600 text-white font-bold rounded-lg hover:bg-white/5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                Call Us
              </a>
            </div>
          </div>
        </section>
      </main>

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
