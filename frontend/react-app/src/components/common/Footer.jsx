import { Link } from "react-router-dom";

const LINKS = {
  Explore: [
    { label: "All Rooms", to: "/rooms" },
    { label: "Search Stays", to: "/search" },
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "FAQ", to: "/faq" },
  ],
  Account: [
    { label: "Sign In", to: "/login" },
    { label: "Create Account", to: "/register" },
    { label: "My Bookings", to: "/my-bookings" },
    { label: "My Profile", to: "/profile" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
    { label: "Cookie Policy", to: "#" },
    { label: "Accessibility", to: "#" },
  ],
};

const AWARDS = [
  { icon: "emoji_events", label: "Best Luxury Hotel 2025" },
  { icon: "star", label: "4.9 / 5 Guest Rating" },
  { icon: "verified", label: "Certified Excellence" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-8">
          {AWARDS.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/60">
              <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <span className="text-xs font-semibold tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">Azure Horizon</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Where every stay becomes a cherished memory. World-class luxury and warm hospitality, curated for the modern traveller.
            </p>
            <div className="space-y-3">
              {[
                { icon: "mail", text: "concierge@azurehorizon.com" },
                { icon: "call", text: "+1 (800) 928-7468" },
                { icon: "location_on", text: "1 Azure Drive, Miami Beach, FL" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/50">
                  <span className="material-symbols-outlined text-primary text-base">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              {["public", "forum", "share", "photo_camera"].map((icon) => (
                <a key={icon} href="#"
                  className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/15 transition-all">
                  <span className="material-symbols-outlined text-base">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-5">{heading}</p>
              <ul className="space-y-3">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/55 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 Azure Horizon. All rights reserved.</p>
          <p className="text-xs text-white/20">Crafted with care for travellers who love the extraordinary.</p>
        </div>
      </div>
    </footer>
  );
}
