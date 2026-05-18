import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Country data: { code, name, flag, dial, digits, mask }
// mask: 'X' = digit placeholder, other chars = literal separators
// ---------------------------------------------------------------------------
const COUNTRIES = [
  { code: "UZ", name: "Uzbekistan",    flag: "🇺🇿", dial: "+998", digits: 9,  mask: "(XX) XXX-XX-XX" },
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1",   digits: 10, mask: "(XXX) XXX-XXXX" },
  { code: "CA", name: "Canada",        flag: "🇨🇦", dial: "+1",   digits: 10, mask: "(XXX) XXX-XXXX" },
  { code: "GB", name: "United Kingdom",flag: "🇬🇧", dial: "+44",  digits: 10, mask: "XXXX XXXXXX" },
  { code: "RU", name: "Russia",        flag: "🇷🇺", dial: "+7",   digits: 10, mask: "(XXX) XXX-XX-XX" },
  { code: "KZ", name: "Kazakhstan",    flag: "🇰🇿", dial: "+7",   digits: 10, mask: "(XXX) XXX-XX-XX" },
  { code: "TR", name: "Turkey",        flag: "🇹🇷", dial: "+90",  digits: 10, mask: "(XXX) XXX XX XX" },
  { code: "DE", name: "Germany",       flag: "🇩🇪", dial: "+49",  digits: 10, mask: "XXX XXXXXXX" },
  { code: "FR", name: "France",        flag: "🇫🇷", dial: "+33",  digits: 9,  mask: "X XX XX XX XX" },
  { code: "IT", name: "Italy",         flag: "🇮🇹", dial: "+39",  digits: 10, mask: "XXX XXX XXXX" },
  { code: "ES", name: "Spain",         flag: "🇪🇸", dial: "+34",  digits: 9,  mask: "XXX XXX XXX" },
  { code: "CN", name: "China",         flag: "🇨🇳", dial: "+86",  digits: 11, mask: "XXX XXXX XXXX" },
  { code: "IN", name: "India",         flag: "🇮🇳", dial: "+91",  digits: 10, mask: "XXXXX XXXXX" },
  { code: "PK", name: "Pakistan",      flag: "🇵🇰", dial: "+92",  digits: 10, mask: "(XXX) XXXXXXX" },
  { code: "AE", name: "UAE",           flag: "🇦🇪", dial: "+971", digits: 9,  mask: "XX XXX XXXX" },
  { code: "SA", name: "Saudi Arabia",  flag: "🇸🇦", dial: "+966", digits: 9,  mask: "XX XXX XXXX" },
  { code: "KG", name: "Kyrgyzstan",    flag: "🇰🇬", dial: "+996", digits: 9,  mask: "(XXX) XXX-XXX" },
  { code: "TJ", name: "Tajikistan",    flag: "🇹🇯", dial: "+992", digits: 9,  mask: "XX XXX XXXX" },
  { code: "TM", name: "Turkmenistan",  flag: "🇹🇲", dial: "+993", digits: 8,  mask: "XXXX XXXX" },
  { code: "AZ", name: "Azerbaijan",    flag: "🇦🇿", dial: "+994", digits: 9,  mask: "XX XXX XXXX" },
  { code: "GE", name: "Georgia",       flag: "🇬🇪", dial: "+995", digits: 9,  mask: "XXX XXX XXX" },
  { code: "AM", name: "Armenia",       flag: "🇦🇲", dial: "+374", digits: 8,  mask: "XX XXXXXX" },
  { code: "UA", name: "Ukraine",       flag: "🇺🇦", dial: "+380", digits: 9,  mask: "(XX) XXX-XX-XX" },
  { code: "BY", name: "Belarus",       flag: "🇧🇾", dial: "+375", digits: 9,  mask: "(XX) XXX-XX-XX" },
  { code: "PL", name: "Poland",        flag: "🇵🇱", dial: "+48",  digits: 9,  mask: "XXX XXX XXX" },
  { code: "NL", name: "Netherlands",   flag: "🇳🇱", dial: "+31",  digits: 9,  mask: "X XX XX XX XX" },
  { code: "SE", name: "Sweden",        flag: "🇸🇪", dial: "+46",  digits: 9,  mask: "XX XXX XXXX" },
  { code: "NO", name: "Norway",        flag: "🇳🇴", dial: "+47",  digits: 8,  mask: "XXXX XXXX" },
  { code: "AU", name: "Australia",     flag: "🇦🇺", dial: "+61",  digits: 9,  mask: "XXX XXX XXX" },
  { code: "JP", name: "Japan",         flag: "🇯🇵", dial: "+81",  digits: 10, mask: "XX XXXX XXXX" },
  { code: "KR", name: "South Korea",   flag: "🇰🇷", dial: "+82",  digits: 10, mask: "XX XXXX XXXX" },
  { code: "BR", name: "Brazil",        flag: "🇧🇷", dial: "+55",  digits: 11, mask: "(XX) XXXXX-XXXX" },
  { code: "MX", name: "Mexico",        flag: "🇲🇽", dial: "+52",  digits: 10, mask: "XXX XXX XXXX" },
  { code: "AR", name: "Argentina",     flag: "🇦🇷", dial: "+54",  digits: 10, mask: "(XXX) XXX-XXXX" },
  { code: "ZA", name: "South Africa",  flag: "🇿🇦", dial: "+27",  digits: 9,  mask: "XX XXX XXXX" },
  { code: "EG", name: "Egypt",         flag: "🇪🇬", dial: "+20",  digits: 10, mask: "XXX XXX XXXX" },
  { code: "NG", name: "Nigeria",       flag: "🇳🇬", dial: "+234", digits: 10, mask: "XXX XXX XXXX" },
  { code: "SG", name: "Singapore",     flag: "🇸🇬", dial: "+65",  digits: 8,  mask: "XXXX XXXX" },
  { code: "MY", name: "Malaysia",      flag: "🇲🇾", dial: "+60",  digits: 9,  mask: "XX XXXX XXXX" },
  { code: "ID", name: "Indonesia",     flag: "🇮🇩", dial: "+62",  digits: 10, mask: "XXX XXXX XXXX" },
  { code: "PH", name: "Philippines",   flag: "🇵🇭", dial: "+63",  digits: 10, mask: "XXX XXX XXXX" },
  { code: "TH", name: "Thailand",      flag: "🇹🇭", dial: "+66",  digits: 9,  mask: "XX XXX XXXX" },
  { code: "IL", name: "Israel",        flag: "🇮🇱", dial: "+972", digits: 9,  mask: "XX XXX XXXX" },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // Uzbekistan

// ---------------------------------------------------------------------------
// Apply mask: digits is a raw digit string, returns formatted display value.
// ---------------------------------------------------------------------------
function applyMask(digits, mask) {
  let di = 0;
  let result = "";
  for (let i = 0; i < mask.length && di < digits.length; i++) {
    if (mask[i] === "X") {
      result += digits[di++];
    } else {
      // Only emit separator if there is a following digit
      if (di < digits.length) result += mask[i];
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Parse an E.164 string into { country, localDigits } or null
// ---------------------------------------------------------------------------
function parseE164(e164) {
  if (!e164 || !e164.startsWith("+")) return null;
  // Sort by longest dial code first to avoid partial matches (+1 vs +1xxx)
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (e164.startsWith(c.dial)) {
      const localDigits = e164.slice(c.dial.length).replace(/\D/g, "");
      return { country: c, localDigits };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// PhoneInput component
// ---------------------------------------------------------------------------
export default function PhoneInput({ value = "", onChange, required = false, className = "" }) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [localDigits, setLocalDigits] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Parse incoming value prop on mount / when it changes externally
  useEffect(() => {
    if (!value) {
      setLocalDigits("");
      return;
    }
    const parsed = parseE164(value);
    if (parsed) {
      setCountry(parsed.country);
      setLocalDigits(parsed.localDigits.slice(0, parsed.country.digits));
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Emit e.164 whenever country or localDigits changes
  function emit(newCountry, newDigits) {
    const digits = newDigits.slice(0, newCountry.digits);
    const e164 = digits.length > 0 ? `${newCountry.dial}${digits}` : "";
    onChange?.(e164);
  }

  function handleCountrySelect(c) {
    setCountry(c);
    setOpen(false);
    setSearch("");
    emit(c, localDigits);
    // Focus the number input after selection
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleNumberInput(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, country.digits);
    setLocalDigits(raw);
    emit(country, raw);
  }

  const displayValue = applyMask(localDigits, country.mask);

  const filteredCountries = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  // Build placeholder from mask (replace X with digit hint)
  const placeholder = country.mask.replace(/X/g, "0");

  return (
    <div ref={wrapperRef} className={`relative flex ${className}`}>
      {/* Country selector button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-l-lg",
          "bg-surface-container-low hover:bg-surface-container transition-colors",
          "text-sm font-semibold shrink-0 select-none",
          "focus:outline-none focus:border-primary",
          open ? "border-primary bg-primary/5 rounded-bl-none" : "",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-lg leading-none" role="img" aria-label={country.name}>
          {country.flag}
        </span>
        <span className="text-on-surface-variant font-bold tabular-nums text-xs tracking-tight">
          {country.dial}
        </span>
        <span
          className={`material-symbols-outlined text-[14px] text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>

      {/* Number input */}
      <input
        ref={inputRef}
        type="tel"
        required={required}
        inputMode="numeric"
        value={displayValue}
        onChange={handleNumberInput}
        placeholder={placeholder}
        className={[
          "flex-1 border border-l-0 border-outline-variant rounded-r-lg",
          "px-3 py-2 text-sm font-semibold tracking-wide",
          "focus:outline-none focus:border-primary transition-colors",
          "bg-white placeholder:text-on-surface-variant/40 placeholder:font-normal",
        ].join(" ")}
        aria-label="Phone number"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "320px" }}
        >
          {/* Search bar */}
          <div className="px-3 pt-3 pb-2 border-b border-outline-variant/30">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px]">
                search
              </span>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-outline-variant focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Country list */}
          <ul className="overflow-y-auto flex-1" role="listbox">
            {filteredCountries.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-on-surface-variant">No results</li>
            ) : (
              filteredCountries.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-container-low transition-colors text-left",
                      c.code === country.code ? "bg-primary/5 text-primary font-bold" : "text-on-surface",
                    ].join(" ")}
                    role="option"
                    aria-selected={c.code === country.code}
                  >
                    <span className="text-xl leading-none w-7 text-center shrink-0" role="img" aria-hidden>
                      {c.flag}
                    </span>
                    <span className="flex-1 truncate font-medium">{c.name}</span>
                    <span className="text-xs text-on-surface-variant font-bold tabular-nums shrink-0">
                      {c.dial}
                    </span>
                    {c.code === country.code && (
                      <span className="material-symbols-outlined text-[14px] text-primary shrink-0">
                        check
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
