/**
 * DateRangePicker — same two-month calendar as the main landing page.
 *
 * Props
 *   checkIn   : string "YYYY-MM-DD" | ""
 *   checkOut  : string "YYYY-MM-DD" | ""
 *   onChange  : ({checkIn: string, checkOut: string}) => void
 *   label?    : string — label shown above the trigger (optional)
 *   compact?  : bool  — smaller trigger for tight layouts
 */

import { useEffect, useRef, useState } from "react";

const BLUE = "#0071C2";
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const FLEX_OPTIONS = [
  { label: "Exact dates", days: 0 },
  { label: "+ 1 day",     days: 1 },
  { label: "+ 2 days",    days: 2 },
  { label: "+ 3 days",    days: 3 },
  { label: "+ 7 days",    days: 7 },
];

function sod(d) { const c = new Date(d); c.setHours(0,0,0,0); return c; }
const TODAY = sod(new Date());

function dim(y, m) { return new Date(y, m + 1, 0).getDate(); }
function fwd(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; }

function toDate(str) { return str ? sod(new Date(str + "T00:00:00")) : null; }
function toStr(d)    { return d ? d.toISOString().split("T")[0] : ""; }

function fmt(str) {
  if (!str) return "";
  const d = toDate(str);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const navBtn = {
  width: 28, height: 28, borderRadius: "50%", border: "1px solid #d0d0d0",
  background: "#fff", cursor: "pointer", fontSize: 20, lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center", color: "#333",
};

export default function DateRangePicker({ checkIn = "", checkOut = "", onChange, label, compact = false }) {
  const [open, setOpen]         = useState(false);
  const [calTab, setCalTab]     = useState("calendar");
  const [flexDays, setFlexDays] = useState(0);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [hoverDay, setHoverDay] = useState(null);
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());

  const wrapRef = useRef(null);

  // internal Date objects derived from props
  const ciDate = toDate(checkIn);
  const coDate = toDate(checkOut);

  // close on outside click
  useEffect(() => {
    function h(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const rMonth = viewMonth === 11 ? 0       : viewMonth + 1;
  const rYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDay(date) {
    if (!ciDate || !pickingEnd) {
      onChange({ checkIn: toStr(date), checkOut: "" });
      setPickingEnd(true);
    } else {
      if (date < ciDate) {
        onChange({ checkIn: toStr(date), checkOut: "" });
      } else {
        onChange({ checkIn: toStr(ciDate), checkOut: toStr(date) });
        setPickingEnd(false);
        setOpen(false);
      }
    }
  }

  function isStart(d)  { return ciDate && d.getTime() === ciDate.getTime(); }
  function isEnd(d)    { return coDate && d.getTime() === coDate.getTime(); }
  function inRange(d) {
    const end = coDate || (pickingEnd && hoverDay);
    if (!ciDate || !end) return false;
    return d > ciDate && d < end;
  }

  function renderMonth(y, m, showPrev, showNext) {
    const total  = dim(y, m);
    const offset = fwd(y, m);
    const name   = new Date(y, m, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    const cells  = [];

    for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= total; d++) {
      const date  = sod(new Date(y, m, d));
      const past  = date < TODAY;
      const start = isStart(date);
      const end   = isEnd(date);
      const range = inRange(date);
      const hover = pickingEnd && hoverDay && ciDate && date > ciDate && date <= hoverDay;

      let bg = "transparent", color = past ? "#bbb" : "#1a1a1a", br = "50%";
      if (start || end)         { bg = BLUE;    color = "#fff"; }
      else if (range || hover)  { bg = "#d5e8f5"; br = "0"; }

      if ((range || hover) && (d === 1 || offset > 0 && d === 1)) br = "50% 0 0 50%";
      if (start && (range || hover)) br = "50% 0 0 50%";
      if (end)   br = "0 50% 50% 0";

      cells.push(
        <div key={d} style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
          <button
            type="button"
            disabled={past}
            onMouseEnter={() => pickingEnd && setHoverDay(date)}
            onMouseLeave={() => setHoverDay(null)}
            onClick={() => !past && handleDay(date)}
            style={{
              width:36, height:36, borderRadius: br,
              background: bg, color,
              border:"none", cursor: past ? "default" : "pointer",
              fontSize:13, fontWeight: start||end ? 700 : 400,
              transition:"background .1s",
            }}
          >{d}</button>
        </div>
      );
    }

    return (
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          {showPrev ? <button type="button" onClick={prevMonth} style={navBtn}>&#8249;</button> : <div style={{width:28}}/>}
          <span style={{ fontWeight:700, fontSize:14 }}>{name}</span>
          {showNext ? <button type="button" onClick={nextMonth} style={navBtn}>&#8250;</button> : <div style={{width:28}}/>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:12, color:"#666", fontWeight:600, padding:"4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", rowGap:2 }}>
          {cells}
        </div>
      </div>
    );
  }

  const displayLabel = checkIn
    ? `${fmt(checkIn)} — ${checkOut ? fmt(checkOut) : "Check-out"}`
    : "Check-in — Check-out";

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      {label && (
        <span style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:"#64748b", marginBottom:4 }}>
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding: compact ? "8px 12px" : "10px 14px",
          border:"1.5px solid #e2e8f0", borderRadius:8,
          background:"#fff", cursor:"pointer", width:"100%",
          fontSize:14, fontWeight:500, color: checkIn ? "#0f172a" : "#94a3b8",
          transition:"border-color .15s",
          ...(open ? { borderColor: BLUE } : {}),
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" style={{flexShrink:0}}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
        <span style={{flex:1, textAlign:"left", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          {displayLabel}
        </span>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange({checkIn:"",checkOut:""}); setPickingEnd(false); }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"#94a3b8", lineHeight:1 }}
          >✕</button>
        )}
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position:"absolute", top:"calc(100% + 6px)", left:0,
            background:"#fff", border:"1px solid #e0e0e0", borderRadius:8,
            boxShadow:"0 8px 32px rgba(0,0,0,.15)", zIndex:300,
            padding:20, minWidth:580,
          }}
        >
          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #e0e0e0", marginBottom:16 }}>
            {["calendar","flexible"].map(tab => (
              <button key={tab} type="button" onClick={() => setCalTab(tab)} style={{
                padding:"8px 20px", fontSize:13, fontWeight:600,
                background:"none", border:"none", cursor:"pointer",
                color: calTab===tab ? BLUE : "#555",
                borderBottom: calTab===tab ? `2px solid ${BLUE}` : "2px solid transparent",
                marginBottom:-1,
              }}>
                {tab==="calendar" ? "Calendar" : "I'm flexible"}
              </button>
            ))}
          </div>

          {calTab === "calendar" ? (
            <>
              <div style={{ display:"flex", gap:24 }}>
                {renderMonth(viewYear, viewMonth, true, false)}
                {renderMonth(rYear,   rMonth,    false, true)}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:16, justifyContent:"center", flexWrap:"wrap" }}>
                {FLEX_OPTIONS.map(({ label: fl, days }) => (
                  <button key={fl} type="button" onClick={() => setFlexDays(days)} style={{
                    padding:"6px 16px", borderRadius:20, fontSize:13, fontWeight:600,
                    border:`1px solid ${flexDays===days ? BLUE : "#d0d0d0"}`,
                    background: flexDays===days ? "#e8f0fe" : "#fff",
                    color: flexDays===days ? BLUE : "#444",
                    cursor:"pointer",
                  }}>{fl}</button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding:"20px 0", textAlign:"center", color:"#555", fontSize:14 }}>
              <p style={{ marginBottom:12, fontWeight:600 }}>How long do you want to stay?</p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {["Weekend","1 week","2 weeks","1 month"].map(opt => (
                  <button key={opt} type="button" style={{
                    padding:"8px 20px", borderRadius:20, border:"1px solid #d0d0d0",
                    background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600,
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
