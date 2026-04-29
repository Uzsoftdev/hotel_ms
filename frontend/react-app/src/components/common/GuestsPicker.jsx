import { useEffect, useRef, useState } from "react";

const BLUE = "#0071C2";

function counterBtnStyle(disabled) {
  return {
    width: 32, height: 32, borderRadius: "50%",
    border: `1px solid ${disabled ? "#e0e0e0" : "#999"}`,
    background: "#fff", cursor: disabled ? "default" : "pointer",
    fontSize: 18, color: disabled ? "#ccc" : "#333",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 400,
  };
}

export default function GuestsPicker({ adults = 1, children = 0, rooms = 1, pets = false, onChange }) {
  const [open, setOpen]       = useState(false);
  const [_adults, setAdults]   = useState(adults);
  const [_children, setChildren] = useState(children);
  const [_rooms, setRooms]     = useState(rooms);
  const [_pets, setPets]       = useState(pets);
  const ref = useRef(null);

  useEffect(() => { setAdults(adults); },   [adults]);
  useEffect(() => { setChildren(children); }, [children]);
  useEffect(() => { setRooms(rooms); },     [rooms]);
  useEffect(() => { setPets(pets); },       [pets]);

  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function handleDone() {
    onChange?.({ adults: _adults, children: _children, rooms: _rooms, pets: _pets });
    setOpen(false);
  }

  const label = `${_adults} adult${_adults !== 1 ? "s" : ""} · ${_children} child${_children !== 1 ? "ren" : ""} · ${_rooms} room${_rooms !== 1 ? "s" : ""}`;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 border ${open ? "border-primary" : "border-outline-variant"} rounded-lg px-3 py-2.5 text-sm font-semibold bg-white text-on-surface focus:outline-none transition-colors`}
      >
        <span className="material-symbols-outlined text-slate-400 text-sm">group</span>
        <span className="flex-1 text-left text-slate-700 truncate">{label}</span>
        <span className="material-symbols-outlined text-slate-400 text-xs">expand_more</span>
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,.15)", zIndex: 300,
            padding: "16px 20px", minWidth: 280,
          }}
        >
          {[
            { label: "Adults",   sub: "Age 18+",  val: _adults,   set: setAdults,   min: 1,  max: 30 },
            { label: "Children", sub: "Age 0–17", val: _children, set: setChildren, min: 0,  max: 10 },
            { label: "Rooms",    sub: null,        val: _rooms,    set: setRooms,    min: 1,  max: 30 },
          ].map(({ label, sub, val, set, min, max }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                {sub && <div style={{ fontSize: 12, color: "#888" }}>{sub}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button type="button" onClick={() => set(v => Math.max(min, v - 1))} style={counterBtnStyle(val === min)}>−</button>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{val}</span>
                <button type="button" onClick={() => set(v => Math.min(max, v + 1))} style={counterBtnStyle(val === max)}>+</button>
              </div>
            </div>
          ))}

          {/* Pets */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Traveling with pets?</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                Assistance animals aren't considered pets.{" "}
                <span style={{ color: BLUE, cursor: "pointer", textDecoration: "underline" }}>Learn more</span>
              </div>
            </div>
            <div
              onClick={() => setPets(v => !v)}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
                background: _pets ? BLUE : "#ccc", transition: "background .2s", position: "relative",
              }}
            >
              <div style={{
                position: "absolute", top: 2, left: _pets ? 22 : 2, width: 20, height: 20,
                borderRadius: "50%", background: "#fff", transition: "left .2s",
                boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              }} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleDone}
            style={{
              marginTop: 8, width: "100%", padding: "10px 0",
              background: "#fff", border: `2px solid ${BLUE}`, borderRadius: 4,
              color: BLUE, fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
