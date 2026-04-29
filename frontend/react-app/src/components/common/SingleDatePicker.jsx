/**
 * SingleDatePicker — same calendar style as the landing page, for single dates.
 *
 * Props
 *   value     : string "YYYY-MM-DD" | ""
 *   onChange  : (string) => void
 *   label?    : string
 *   min?      : string "YYYY-MM-DD"  — disables dates before this
 *   compact?  : bool
 *   placeholder? : string
 */

import { useEffect, useRef, useState } from "react";

const BLUE = "#0071C2";
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function sod(d) { const c = new Date(d); c.setHours(0,0,0,0); return c; }
const TODAY = sod(new Date());

function dim(y, m) { return new Date(y, m + 1, 0).getDate(); }
function fwd(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; }
function toDate(str) { return str ? sod(new Date(str + "T00:00:00")) : null; }
function toStr(d)    { return d ? d.toISOString().split("T")[0] : ""; }
function fmt(str) {
  if (!str) return "";
  const d = toDate(str);
  return d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" });
}

const navBtn = {
  width:28, height:28, borderRadius:"50%", border:"1px solid #d0d0d0",
  background:"#fff", cursor:"pointer", fontSize:20, lineHeight:1,
  display:"flex", alignItems:"center", justifyContent:"center", color:"#333",
};

export default function SingleDatePicker({ value = "", onChange, label, min = "", compact = false, placeholder = "Select date" }) {
  const [open, setOpen]       = useState(false);
  const [viewYear, setViewYear]   = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const wrapRef = useRef(null);

  const selDate = toDate(value);
  const minDate = min ? toDate(min) : null;

  useEffect(() => {
    function h(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDay(date) {
    onChange(toStr(date));
    setOpen(false);
  }

  function renderMonth(y, m) {
    const total  = dim(y, m);
    const offset = fwd(y, m);
    const name   = new Date(y, m, 1).toLocaleString("en-US", { month:"long", year:"numeric" });
    const cells  = [];

    for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= total; d++) {
      const date     = sod(new Date(y, m, d));
      const disabled = date < TODAY || (minDate && date < minDate);
      const selected = selDate && date.getTime() === selDate.getTime();

      cells.push(
        <div key={d} style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && handleDay(date)}
            style={{
              width:36, height:36, borderRadius:"50%",
              background: selected ? BLUE : "transparent",
              color: selected ? "#fff" : disabled ? "#bbb" : "#1a1a1a",
              border:"none", cursor: disabled ? "default" : "pointer",
              fontSize:13, fontWeight: selected ? 700 : 400,
              transition:"background .1s",
            }}
          >{d}</button>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <button type="button" onClick={prevMonth} style={navBtn}>&#8249;</button>
          <span style={{ fontWeight:700, fontSize:14 }}>{name}</span>
          <button type="button" onClick={nextMonth} style={navBtn}>&#8250;</button>
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

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      {label && (
        <span style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:"#64748b", marginBottom:4 }}>
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding: compact ? "8px 12px" : "10px 14px",
          border:"1.5px solid #e2e8f0", borderRadius:8,
          background:"#fff", cursor:"pointer", width:"100%",
          fontSize:14, fontWeight:500, color: value ? "#0f172a" : "#94a3b8",
          transition:"border-color .15s",
          ...(open ? { borderColor: BLUE } : {}),
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" style={{flexShrink:0}}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
        <span style={{ flex:1, textAlign:"left" }}>{value ? fmt(value) : placeholder}</span>
        {value && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(""); }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"#94a3b8", lineHeight:1 }}
          >✕</button>
        )}
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position:"absolute", top:"calc(100% + 6px)", left:0,
            background:"#fff", border:"1px solid #e0e0e0", borderRadius:8,
            boxShadow:"0 8px 32px rgba(0,0,0,.15)", zIndex:300,
            padding:20, minWidth:300,
          }}
        >
          {renderMonth(viewYear, viewMonth)}
        </div>
      )}
    </div>
  );
}
