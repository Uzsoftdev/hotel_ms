import { useState } from "react";
import { Link } from "react-router-dom";
import background from "../../assets/images/room_back.png";
import room1 from "../../assets/images/room1.png";
import room2 from "../../assets/images/room2.png";
import hotel3 from "../../assets/images/hotel3.png";

const TABS = ["All", "Standard", "Deluxe", "Suite", "Presidential"];

const rooms = [
  {
    type: "Standard",
    name: "Azure Standard King",
    desc: "Elegantly appointed room featuring a signature plush king bed and artisanal locally-sourced decor.",
    amenities: [{ icon: "wifi", label: "Free WiFi" }, { icon: "ac_unit", label: "Climate Control" }, { icon: "flatware", label: "Mini Bar" }],
    price: "$299",
    image: room1,
  },
  {
    type: "Deluxe",
    name: "Horizon Deluxe Suite",
    desc: "Spacious living area with a private balcony overlooking our lush Mediterranean gardens.",
    amenities: [{ icon: "balcony", label: "Private Deck" }, { icon: "bathtub", label: "Spa Tub" }, { icon: "local_cafe", label: "Nespresso" }],
    price: "$450",
    image: room2,
  },
  {
    type: "Suite",
    name: "Grand Ocean Suite",
    desc: "A sweeping suite with panoramic sea views, a separate lounge, and bespoke butler service.",
    amenities: [{ icon: "pool", label: "Pool Access" }, { icon: "spa", label: "Spa Credits" }, { icon: "room_service", label: "Room Service" }],
    price: "$750",
    image: hotel3,
  },
  {
    type: "Presidential",
    name: "Oceanfront Presidential",
    desc: "Our crown jewel. 2,500 sq ft of pure luxury with panoramic 270-degree ocean views.",
    amenities: [{ icon: "concierge", label: "Butler" }, { icon: "pool", label: "Plunge Pool" }, { icon: "dinner_dining", label: "Private Chef" }],
    price: "$1,200",
    image: room1,
  },
  {
    type: "Standard",
    name: "Garden View Twin",
    desc: "Light-filled twin room with serene garden views and premium bedding for the perfect rest.",
    amenities: [{ icon: "wifi", label: "Free WiFi" }, { icon: "local_parking", label: "Parking" }, { icon: "ac_unit", label: "Climate Control" }],
    price: "$249",
    image: room2,
  },
  {
    type: "Deluxe",
    name: "Skyline Deluxe Double",
    desc: "Contemporary double room with floor-to-ceiling windows framing a stunning city skyline.",
    amenities: [{ icon: "wifi", label: "Free WiFi" }, { icon: "bathtub", label: "Rain Shower" }, { icon: "flatware", label: "Mini Bar" }],
    price: "$520",
    image: hotel3,
  },
];

export default function Rooms() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? rooms : rooms.filter((r) => r.type === activeTab);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Azure Horizon</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-sm font-semibold text-primary transition-colors" to="/rooms">Rooms</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">Register</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-96 w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
          <img alt="Luxury hotel suite with floor-to-ceiling ocean views" className="w-full h-full object-cover scale-105" src={background} />
        </div>
        <div className="relative z-20 px-8 md:px-20 max-w-7xl mx-auto w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">Our Rooms &amp; Suites</h1>
          <p className="text-lg font-medium text-white/90 max-w-2xl">From cozy retreats to presidential suites — every room is a sanctuary of refined elegance.</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all ${activeTab === tab
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "border border-slate-200 dark:border-slate-700 text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Room Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((room) => (
            <div key={room.name} className="group bg-surface-bright rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={room.image} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{room.type}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-extrabold text-on-surface mb-2">{room.name}</h3>
                <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{room.desc}</p>
                <div className="flex items-center gap-4 mb-6 text-on-surface-variant">
                  {room.amenities.map((a) => (
                    <div key={a.label} className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">{a.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{a.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/50 pt-4">
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">From</span>
                    <span className="text-2xl font-extrabold text-primary">{room.price}<span className="text-sm font-medium text-on-surface-variant">/night</span></span>
                  </div>
                  <Link
                    to="/room-details"
                    className="bg-primary text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-on-surface-variant font-medium py-16">No rooms found for this category.</p>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#137fec20_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8 font-medium">Our concierge team is available 24/7 to help you find the perfect accommodation.</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">call</span>
                Contact Concierge
              </Link>
              <button className="border border-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/5 transition-all" type="button" onClick={() => setActiveTab("All")}>
                View All Categories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">Azure Horizon</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/about">About</Link>
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
