import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const YELLOW = "rgba(255, 222, 33, 1)";
const BLUE   = "#0071C2";
const DAYS   = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const FLEX_OPTIONS = [
  { label: "Exact dates", days: 0 },
  { label: "+ 1 day",     days: 1 },
  { label: "+ 2 days",    days: 2 },
  { label: "+ 3 days",    days: 3 },
  { label: "+ 7 days",    days: 7 },
];

function startOfDay(d) {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c;
}
const todayD = startOfDay(new Date());

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; } // Mon=0

function fmtShort(d) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtFull(d) {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

export default function BookingSearchBar() {
  const navigate = useNavigate();

  const [destination, setDestination]   = useState("");
  const [checkIn,  setCheckIn]           = useState(null);
  const [checkOut, setCheckOut]          = useState(null);
  const [adults,   setAdults]            = useState(2);
  const [children, setChildren]          = useState(0);
  const [rooms,    setRooms]             = useState(1);
  const [pets,     setPets]              = useState(false);
  const [forWork,  setForWork]           = useState(false);

  const [showCal,    setShowCal]         = useState(false);
  const [showGuests, setShowGuests]      = useState(false);
  const [calTab,     setCalTab]          = useState("calendar");
  const [flexDays,   setFlexDays]        = useState(0);
  const [pickingEnd, setPickingEnd]      = useState(false);
  const [hoverDay,   setHoverDay]        = useState(null);

  // ── Autocomplete state ─────────────────────────────────────────────────────
  const [suggestions,    setSuggestions]    = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sugLoading,     setSugLoading]     = useState(false);
  const [activeSug,      setActiveSug]      = useState(-1);
  const debounceRef = useRef(null);
  const destWrapRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    setSugLoading(true);
    try {
      const res = await api.get(`/public/search/hotels?q=${encodeURIComponent(q)}&per_page=8`);
      const hotels = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setSuggestions(hotels);
      setShowSuggestions(true);
      setActiveSug(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setSugLoading(false);
    }
  }, []);

  // Debounced input handler
  function handleDestChange(e) {
    const val = e.target.value;
    setDestination(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function selectSuggestion(hotel) {
    // Use just the city so the search ILIKE query matches the city column
    setDestination(hotel.city || hotel.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveSug(-1);
  }

  function handleDestKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSug(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSug(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeSug >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeSug]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  const [viewYear,  setViewYear]  = useState(todayD.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayD.getMonth());

  const calRef   = useRef(null);
  const guestRef = useRef(null);
  const destRef  = useRef(null);

  // close on outside click
  useEffect(() => {
    function h(e) {
      if (calRef.current   && !calRef.current.contains(e.target))   setShowCal(false);
      if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuests(false);
      if (destWrapRef.current && !destWrapRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // right month
  const rMonth = viewMonth === 11 ? 0    : viewMonth + 1;
  const rYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(date) {
    if (!checkIn || pickingEnd === false) {
      setCheckIn(date); setCheckOut(null); setPickingEnd(true);
    } else {
      if (date < checkIn) {
        setCheckIn(date); setCheckOut(null);
      } else {
        setCheckOut(date); setPickingEnd(false); setShowCal(false);
      }
    }
  }

  function isStart(d)   { return checkIn  && d.getTime() === checkIn.getTime(); }
  function isEnd(d)     { return checkOut && d.getTime() === checkOut.getTime(); }
  function inRange(d) {
    const end = checkOut || (pickingEnd && hoverDay);
    if (!checkIn || !end) return false;
    return d > checkIn && d < end;
  }
  function isPast(d)    { return d < todayD; }

  function renderMonth(y, m, showPrev, showNext) {
    const totalDays = daysInMonth(y, m);
    const offset    = firstWeekday(y, m);
    const name = new Date(y, m, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    const cells = [];

    for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= totalDays; d++) {
      const date   = startOfDay(new Date(y, m, d));
      const past   = isPast(date);
      const start  = isStart(date);
      const end    = isEnd(date);
      const range  = inRange(date);
      const hover  = pickingEnd && hoverDay && checkIn && date > checkIn && date <= hoverDay;

      let bg = "transparent", color = past ? "#bbb" : "#1a1a1a", borderRadius = "50%";
      if (start || end) { bg = BLUE; color = "#fff"; }
      else if (range || hover) { bg = "#d5e8f5"; borderRadius = "0"; color = "#1a1a1a"; }

      // round left/right edges of range
      if (range || hover) {
        if (start || (d === 1) || (d === offset + 1 && offset > 0)) borderRadius = "50% 0 0 50%";
        if (end) borderRadius = "0 50% 50% 0";
      }

      cells.push(
        <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            type="button"
            disabled={past}
            onMouseEnter={() => pickingEnd && setHoverDay(date)}
            onMouseLeave={() => setHoverDay(null)}
            onClick={() => !past && handleDayClick(date)}
            style={{
              width: 36, height: 36, borderRadius,
              background: bg, color,
              border: "none", cursor: past ? "default" : "pointer",
              fontSize: 13, fontWeight: start || end ? 700 : 400,
              transition: "background .1s",
            }}
          >
            {d}
          </button>
        </div>
      );
    }

    return (
      <div style={{ flex: 1 }}>
        {/* Month header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          {showPrev
            ? <button type="button" onClick={prevMonth} style={navBtnStyle}>&#8249;</button>
            : <div style={{ width: 28 }} />}
          <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
          {showNext
            ? <button type="button" onClick={nextMonth} style={navBtnStyle}>&#8250;</button>
            : <div style={{ width: 28 }} />}
        </div>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#666", fontWeight: 600, padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: 2 }}>
          {cells}
        </div>
      </div>
    );
  }

  const dateLabel = checkIn
    ? `${fmtShort(checkIn)} — ${checkOut ? fmtShort(checkOut) : "Check-out date"}`
    : "Check-in date — Check-out date";

  const guestLabel = `${adults} adult${adults !== 1 ? "s" : ""} · ${children} child${children !== 1 ? "ren" : ""} · ${rooms} room${rooms !== 1 ? "s" : ""}`;

  function handleSearch(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (destination) p.set("location", destination);
    if (checkIn)  p.set("checkIn",  fmtFull(checkIn));
    if (checkOut) p.set("checkOut", fmtFull(checkOut));
    p.set("adults",   adults);
    p.set("children", children);
    p.set("rooms",    rooms);
    navigate(`/search?${p.toString()}`);
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <div className="search-bar-row">

          {/* Destination — with live autocomplete */}
          <div ref={destWrapRef} style={{ flex: "0 0 38%", position: "relative" }}>
            <label style={{ ...fieldStyle, border: `2px solid ${YELLOW}`, borderRadius: 4, cursor: "text", background: "#fff", display: "flex" }}>
              <span style={iconStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 9l2-2m0 0l7-7 7 7M5 7v12a1 1 0 001 1h4m4 0h4a1 1 0 001-1V7m-9 5h4"/>
                </svg>
              </span>
              <input
                ref={destRef}
                value={destination}
                onChange={handleDestChange}
                onKeyDown={handleDestKeyDown}
                onFocus={() => destination.trim().length >= 1 && setShowSuggestions(true)}
                placeholder="Where are you going?"
                style={inputStyle}
                autoComplete="off"
              />
              {sugLoading && (
                <span style={{ color: "#aaa", fontSize: 12, flexShrink: 0, display: "flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
            </label>

            {/* Autocomplete dropdown */}
            {showSuggestions && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 300,
                overflow: "hidden",
                animation: "slideDown 0.18s ease",
              }}>
                {suggestions.length === 0 && !sugLoading ? (
                  <div style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>
                    No destinations found for "{destination}"
                  </div>
                ) : (
                  suggestions.map((hotel, i) => (
                    <div
                      key={hotel.id}
                      onMouseDown={() => selectSuggestion(hotel)}
                      onMouseEnter={() => setActiveSug(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 16px", cursor: "pointer",
                        background: i === activeSug ? "#f0f6ff" : "#fff",
                        borderBottom: i < suggestions.length - 1 ? "1px solid #f5f5f5" : "none",
                        transition: "background .1s",
                      }}
                    >
                      <span style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: i === activeSug ? "#dbeafe" : "#f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background .1s",
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke={i === activeSug ? BLUE : "#888"} strokeWidth="2">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          <circle cx="12" cy="9" r="2.5"/>
                        </svg>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {hotel.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
                          {hotel.city}{hotel.country ? `, ${hotel.country}` : ""}
                        </div>
                      </div>
                      {hotel.rating > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", flexShrink: 0 }}>
                          ★ {Number(hotel.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>


          {/* Date range */}
          <div ref={calRef}
            style={{ ...fieldStyle, flex: "0 0 30%", border: `2px solid ${YELLOW}`, borderRadius: 4, cursor: "pointer", position: "relative", background: "#fff" }}
            onClick={() => { setShowCal(v => !v); setShowGuests(false); }}>
            <span style={iconStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
              </svg>
            </span>
            <span style={{ fontSize: 14, color: checkIn ? "#1a1a1a" : "#767676", whiteSpace: "nowrap" }}>
              {dateLabel}
            </span>
            {showCal && (
              <div onClick={e => e.stopPropagation()}
                style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,.15)", zIndex: 200, padding: 20, minWidth: 580 }}>
                <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", marginBottom: 16 }}>
                  {["calendar", "flexible"].map(tab => (
                    <button key={tab} type="button" onClick={() => setCalTab(tab)}
                      style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer", color: calTab === tab ? BLUE : "#555", borderBottom: calTab === tab ? `2px solid ${BLUE}` : "2px solid transparent", marginBottom: -1 }}>
                      {tab === "calendar" ? "Calendar" : "I'm flexible"}
                    </button>
                  ))}
                </div>
                {calTab === "calendar" ? (
                  <>
                    <div style={{ display: "flex", gap: 24 }}>
                      {renderMonth(viewYear, viewMonth, true, false)}
                      {renderMonth(rYear, rMonth, false, true)}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
                      {FLEX_OPTIONS.map(({ label, days }) => (
                        <button key={label} type="button" onClick={() => setFlexDays(days)}
                          style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${flexDays === days ? BLUE : "#d0d0d0"}`, background: flexDays === days ? "#e8f0fe" : "#fff", color: flexDays === days ? BLUE : "#444", cursor: "pointer" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#555", fontSize: 14 }}>
                    <p style={{ marginBottom: 8, fontWeight: 600 }}>How long do you want to stay?</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      {["Weekend", "1 week", "2 weeks", "1 month"].map(opt => (
                        <button key={opt} type="button" style={{ padding: "8px 20px", borderRadius: 20, border: "1px solid #d0d0d0", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Guests */}
          <div ref={guestRef}
            style={{ ...fieldStyle, flex: 1, border: `2px solid ${YELLOW}`, borderRadius: 4, cursor: "pointer", position: "relative", background: "#fff" }}
            onClick={() => { setShowGuests(v => !v); setShowCal(false); }}>
            <span style={iconStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </span>
            <span style={{ fontSize: 14, color: "#1a1a1a", flex: 1, whiteSpace: "nowrap" }}>{guestLabel}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ marginLeft: 4 }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
            {showGuests && (
              <div onClick={e => e.stopPropagation()}
                style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,.15)", zIndex: 200, padding: "16px 20px", minWidth: 280 }}>
                {[
                  { label: "Adults",   sub: "Age 18+",  val: adults,   set: setAdults,   min: 1, max: 30 },
                  { label: "Children", sub: "Age 0–17", val: children, set: setChildren, min: 0, max: 10 },
                  { label: "Rooms",    sub: null,        val: rooms,    set: setRooms,    min: 1, max: 30 },
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Traveling with pets?</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                      Assistance animals aren't considered pets.{" "}
                      <span style={{ color: BLUE, cursor: "pointer", textDecoration: "underline" }}>Learn more</span>
                    </div>
                  </div>
                  <div onClick={() => setPets(v => !v)}
                    style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0, background: pets ? BLUE : "#ccc", transition: "background .2s", position: "relative" }}>
                    <div style={{ position: "absolute", top: 2, left: pets ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                  </div>
                </div>
                <button type="button" onClick={() => setShowGuests(false)}
                  style={{ marginTop: 8, width: "100%", padding: "10px 0", background: "#fff", border: `2px solid ${BLUE}`, borderRadius: 4, color: BLUE, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Search button */}
          <button type="submit"
            style={{ padding: "0 40px", background: BLUE, color: "#fff", border: `2px solid ${YELLOW}`, borderRadius: 4, cursor: "pointer", fontSize: 15, fontWeight: 700, flexShrink: 0, transition: "background .15s", display: "flex", alignItems: "center", gap: 9 }}
            onMouseEnter={e => e.currentTarget.style.background = "#005fa3"}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="17" y1="17" x2="22" y2="22"/>
            </svg>
            Search
          </button>
        </div>
      </form>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={forWork} onChange={e => setForWork(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: BLUE, cursor: "pointer" }} />
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>I'm traveling for work</span>
      </label>
    </div>
  );
}

// ── Micro-styles ──────────────────────────────────────────────────────────────

const fieldStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "14px 16px", minHeight: 56,
};

const iconStyle = {
  color: "#555", flexShrink: 0, display: "flex", alignItems: "center",
};

const inputStyle = {
  flex: 1, fontSize: 14, border: "none", outline: "none",
  background: "transparent", color: "#1a1a1a", fontFamily: "inherit",
};

const navBtnStyle = {
  width: 28, height: 28, borderRadius: "50%", border: "1px solid #d0d0d0",
  background: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center", color: "#333",
};

function counterBtnStyle(disabled) {
  return {
    width: 32, height: 32, borderRadius: "50%",
    border: `1px solid ${disabled ? "#e0e0e0" : "#999"}`,
    background: "#fff", cursor: disabled ? "default" : "pointer",
    fontSize: 18, color: disabled ? "#ccc" : "#333",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 400,
  };
}
