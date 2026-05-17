import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SUGGESTIONS = [
  { icon: "king_bed",      label: "Find a suite",         query: "Suite" },
  { icon: "savings",       label: "Budget rooms",          query: "Economy" },
  { icon: "pool",          label: "Rooms with pool",       query: "Pool" },
  { icon: "wb_sunny",      label: "Ocean view stays",      query: "Ocean View" },
];

const GREETING_LINES = [
  "Looking for the perfect room?",
  "Need help choosing a suite?",
  "I can find your ideal stay ✨",
  "Where would you like to go?",
];

export default function AIHelper() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(GREETING_LINES[0]);
  const [typed, setTyped] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [bubble, setBubble] = useState(true); // hint bubble
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  // Cycle greeting in the hint bubble
  useEffect(() => {
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % GREETING_LINES.length;
      setGreeting(GREETING_LINES[idx]);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Typewriter for greeting inside the panel
  useEffect(() => {
    if (!open) { setTyped(""); return; }
    const msg = "Hi there! 👋 I'm your allStay AI concierge. Tell me what you're looking for and I'll help you find it.";
    let i = 0;
    setTyped("");
    const id = setInterval(() => {
      i++;
      setTyped(msg.slice(0, i));
      if (i >= msg.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [open]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  // Open via custom event (triggered by "Chat with the concierge" button)
  useEffect(() => {
    const handler = () => { setOpen(true); setBubble(false); };
    window.addEventListener("ai-helper:open", handler);
    return () => window.removeEventListener("ai-helper:open", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Hide hint bubble once user opens panel
  function handleToggle() {
    setOpen((o) => !o);
    setBubble(false);
  }

  function handleSearch(q) {
    setOpen(false);
    navigate(`/search?location=${encodeURIComponent(q)}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleSearch(inputVal.trim());
  }

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat panel */}
      {open && (
        <div className="w-80 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
          style={{ background: "#fff", border: "1px solid rgba(37,99,235,.15)" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5"
            style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">allStay AI</p>
              <p className="text-white/70 text-[11px] font-medium flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Online · always ready
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pt-4 pb-2 space-y-4" style={{ background: "#F8FAFC" }}>
            {/* Typewriter message */}
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)" }}>
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm text-sm text-slate-700 font-medium leading-relaxed max-w-[220px]"
                style={{ border: "1px solid #E2E8F0" }}>
                {typed}<span className="animate-pulse">|</span>
              </div>
            </div>

            {/* Quick suggestion chips */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quick picks</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SUGGESTIONS.map(({ icon, label, query }) => (
                  <button key={label} onClick={() => handleSearch(query)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary transition-all text-left"
                    style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
                    <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 flex gap-2 items-center"
            style={{ borderTop: "1px solid #E2E8F0", background: "#fff" }}>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. ocean view suite…"
              className="flex-1 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
            />
            <button type="submit"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
              style={{ background: inputVal.trim() ? "#2563EB" : "#E2E8F0" }}>
              <span className="material-symbols-outlined text-sm" style={{ color: inputVal.trim() ? "#fff" : "#94A3B8" }}>send</span>
            </button>
          </form>
        </div>
      )}

      {/* Hint bubble */}
      {bubble && !open && (
        <div className="bg-white text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg animate-fade-in"
          style={{ border: "1px solid rgba(37,99,235,.15)", whiteSpace: "nowrap" }}
          key={greeting}>
          {greeting}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleToggle}
        aria-label="AI concierge"
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 animate-float"
        style={{ background: "linear-gradient(135deg,#1D4ED8,#2563EB)", boxShadow: "0 8px 32px rgba(37,99,235,.45)" }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-pulse-ring pointer-events-none" />

        <span
          className="material-symbols-outlined text-white text-2xl transition-all duration-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {open ? "close" : "smart_toy"}
        </span>
      </button>
    </div>
  );
}
