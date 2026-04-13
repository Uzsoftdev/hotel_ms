import { Link } from "react-router-dom";
import parisImage from "../../assets/images/paris_1.png";

const details = [
  { label: "Check-in", value: "Oct 12, 2024" },
  { label: "Check-out", value: "Oct 17, 2024" },
  { label: "Guests", value: "2 Adults" },
  { label: "Room Type", value: "Ocean View" },
];

const nextSteps = [
  { icon: "mail", title: "Confirmation email sent", desc: "A detailed itinerary and digital check-in key have been sent to your registered email." },
  { icon: "luggage", title: "Check-in from 3:00 PM", desc: "Early check-in may be available on request. Our team will be ready to welcome you." },
  { icon: "support_agent", title: "24/7 Concierge support", desc: "Our premium concierge team is available around the clock for any special requests." },
];

export default function BookingConfirmation() {
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

      <main className="flex-grow py-16 px-6 max-w-4xl mx-auto w-full">

        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span
            className="material-symbols-outlined text-primary mb-5 animate-bounce"
            style={{ fontSize: "5rem", fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>

          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            Reference #AZH-2024-08471
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-on-surface-variant font-medium max-w-lg leading-relaxed">
            Your luxury escape is secured. A confirmation email has been sent to your inbox with all travel documents and check-in instructions.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 overflow-hidden mb-10">
          <div className="grid md:grid-cols-5">
            {/* Image */}
            <div className="md:col-span-2 relative h-56 md:h-auto">
              <img
                alt="Azure Horizon Royal Suite"
                className="w-full h-full object-cover"
                src={parisImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary px-2 py-1 rounded text-white">
                  Paris, France
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-3 p-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">
                Azure Horizon Royal Suite
              </h2>

              <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-6">
                {details.map((d) => (
                  <div key={d.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{d.label}</p>
                    <p className="text-sm font-bold text-on-surface">{d.value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Status</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Confirmed
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Paid</p>
                  <p className="text-lg font-extrabold text-primary">$5,190.00</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
                <Link
                  to="/login"
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all text-center"
                >
                  View My Bookings
                </Link>
                <Link
                  to="/"
                  className="flex-1 border border-primary text-primary py-3 px-6 rounded-lg font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center mb-6">
            What&apos;s next for your journey?
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((s) => (
              <div key={s.title} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">{s.icon}</span>
                </div>
                <h4 className="font-bold text-sm text-on-surface mb-2">{s.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
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
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            © 2024 Azure Horizon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
