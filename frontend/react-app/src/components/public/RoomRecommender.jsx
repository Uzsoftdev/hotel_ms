import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const OCCASIONS = [
  { key: "honeymoon", label: "Honeymoon", emoji: "💕" },
  { key: "business",  label: "Business",  emoji: "✈️" },
  { key: "family",    label: "Family",    emoji: "👨‍👩‍👧" },
  { key: "solo",      label: "Solo",      emoji: "🧘" },
  { key: "group",     label: "Group",     emoji: "🎉" },
];

const STYLE_OPTIONS = ["Modern", "Luxury", "Minimalist", "Cozy", "Boutique", "Classic"];
const AMENITY_OPTIONS = [
  "Pool", "Spa", "Ocean View", "Balcony", "Kitchen",
  "Pet-friendly", "Gym", "Parking",
];

function matchColor(score) {
  if (score >= 80) return { bg: "#dcfce7", text: "#16a34a", border: "#86efac" };
  if (score >= 60) return { bg: "#fef9c3", text: "#ca8a04", border: "#fde047" };
  return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
}

export default function RoomRecommender() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState(300);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(3);
  const [styles, setStyles] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  function toggleChip(list, setList, value) {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function findRooms() {
    setLoading(true);
    setStep(3);
    try {
      const res = await api.post("/public/ai/recommend", {
        occasion,
        budget_max: budget,
        guests,
        style: styles.join(", "),
        amenities,
        nights,
      });
      setResults(res.data);
    } catch {
      setResults({
        recommendations: [],
        summary:
          "We couldn't fetch recommendations right now. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setStep(1);
    setOccasion("");
    setBudget(300);
    setGuests(2);
    setNights(3);
    setStyles([]);
    setAmenities([]);
    setResults(null);
    setLoading(false);
  }

  return (
    <div
      className="w-full rounded-2xl border border-indigo-100 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf0ff 100%)" }}
    >
      {/* Wizard header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            AI Room Recommender
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tell us about your ideal stay and we'll find your perfect match.
          </p>
        </div>
        {/* Step indicators */}
        <div className="flex items-center gap-2 shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200"
              style={{
                width: 28,
                height: 28,
                background:
                  step === s
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : step > s
                    ? "#c7d2fe"
                    : "#e0e7ff",
                color: step === s ? "#fff" : step > s ? "#4f46e5" : "#a5b4fc",
              }}
            >
              {step > s ? "✓" : s}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* ── Step 1: Occasion ── */}
        {step === 1 && (
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-4">
              What's the occasion?
            </p>
            <div className="flex flex-wrap gap-3">
              {OCCASIONS.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => {
                    setOccasion(key);
                    setStep(2);
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    width: 120,
                    padding: "18px 12px",
                    background: occasion === key ? "#eef2ff" : "#fff",
                    borderColor: occasion === key ? "#6366f1" : "#e0e7ff",
                    boxShadow:
                      occasion === key
                        ? "0 4px 16px rgba(99,102,241,0.2)"
                        : "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{emoji}</span>
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Preferences ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Budget slider */}
            <div>
              <label className="text-sm font-semibold text-slate-600 flex justify-between">
                <span>Budget per night</span>
                <span className="text-indigo-600 font-bold">${budget}</span>
              </label>
              <input
                type="range"
                min={50}
                max={1000}
                step={10}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$50</span>
                <span>$1,000</span>
              </div>
            </div>

            {/* Guests + Nights */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Math.min(10, Math.max(1, Number(e.target.value))))
                  }
                  className="w-full border border-indigo-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Nights
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={nights}
                  onChange={(e) =>
                    setNights(Math.min(30, Math.max(1, Number(e.target.value))))
                  }
                  className="w-full border border-indigo-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Style chips */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">
                Room style{" "}
                <span className="text-xs font-normal text-slate-400">(pick any)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleChip(styles, setStyles, s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                    style={{
                      background: styles.includes(s) ? "#eef2ff" : "#fff",
                      borderColor: styles.includes(s) ? "#6366f1" : "#e0e7ff",
                      color: styles.includes(s) ? "#4f46e5" : "#64748b",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenity chips */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">
                Must-have amenities{" "}
                <span className="text-xs font-normal text-slate-400">(pick any)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleChip(amenities, setAmenities, a)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                    style={{
                      background: amenities.includes(a) ? "#f5f3ff" : "#fff",
                      borderColor: amenities.includes(a) ? "#8b5cf6" : "#e0e7ff",
                      color: amenities.includes(a) ? "#7c3aed" : "#64748b",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={findRooms}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Find My Perfect Stay ✨
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Results ── */}
        {step === 3 && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-500"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                <p className="text-sm font-semibold text-slate-500">
                  Finding your perfect match…
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Summary callout */}
                {results?.summary && (
                  <div className="rounded-xl px-4 py-3 text-sm text-indigo-800 font-medium leading-relaxed"
                    style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
                    {results.summary}
                  </div>
                )}

                {/* Recommendation cards */}
                {results?.recommendations?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.recommendations.map((rec, i) => {
                      const scoreColor = matchColor(rec.match_score ?? 0);
                      return (
                        <div
                          key={rec.room_id ?? i}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col"
                          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}
                        >
                          {/* Card header */}
                          <div className="px-4 pt-4 pb-3 relative">
                            {/* Match score badge */}
                            <div
                              className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full border"
                              style={{
                                background: scoreColor.bg,
                                color: scoreColor.text,
                                borderColor: scoreColor.border,
                              }}
                            >
                              {rec.match_score ?? "—"}% match
                            </div>

                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                              {rec.hotel_name}
                            </p>
                            <h3 className="text-base font-bold text-slate-800 pr-20 leading-snug">
                              {rec.room_name}
                            </h3>
                            <p className="text-indigo-600 font-bold text-sm mt-1">
                              ${rec.price_per_night}
                              <span className="font-normal text-slate-400 text-xs"> / night</span>
                            </p>
                          </div>

                          {/* Style tags */}
                          {rec.style_tags?.length > 0 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                              {rec.style_tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: "#f5f3ff", color: "#7c3aed" }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Match reason */}
                          {rec.match_reason && (
                            <div className="px-4 pb-3">
                              <p className="text-xs text-slate-500 italic leading-relaxed">
                                {rec.match_reason}
                              </p>
                            </div>
                          )}

                          {/* Book Now button */}
                          <div className="px-4 pb-4 mt-auto">
                            <button
                              onClick={() =>
                                navigate(`/booking?room_id=${rec.room_id}`)
                              }
                              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                              style={{
                                background:
                                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No recommendations found. Try adjusting your preferences.
                  </div>
                )}

                {/* Back + Start Over */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={startOver}
                    className="px-5 py-2.5 rounded-xl border border-indigo-200 text-sm font-semibold text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
