import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/common/Navbar";
import DateRangePicker from "../../components/common/DateRangePicker";
import GuestsPicker from "../../components/common/GuestsPicker";
import { createBooking } from "../../services/bookings";
import { processPayment as makePayment } from "../../services/payment";

const today = new Date().toISOString().split("T")[0];

export default function Booking() {
  const { t } = useTranslation("pub_translation");
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state } = useLocation();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: "/booking" } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const roomFromState = state?.room || null;
  const roomId = params.get("room_id") ? Number(params.get("room_id")) : roomFromState?.id || null;
  const preCheckIn = state?.checkIn || params.get("check_in") || "";
  const preCheckOut = state?.checkOut || params.get("check_out") || "";
  const preGuests = state?.guests || Number(params.get("guests")) || 1;
  const pricePerNight = params.get("price") ? Number(params.get("price")) : roomFromState?.price_per_night || 250;
  const roomName = params.get("room_name") ? decodeURIComponent(params.get("room_name")) : roomFromState?.name || "Deluxe Suite";

  const steps = [
    { num: 1, label: t("booking_page.step_indicator.step1"), icon: "person" },
    { num: 2, label: t("booking_page.step_indicator.step2"), icon: "calendar_month" },
    { num: 3, label: t("booking_page.step_indicator.step3"), icon: "payments" },
  ];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill guest details from logged-in user profile
  const [nameParts] = useState(() => {
    const parts = (user?.full_name || "").trim().split(" ");
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  });
  const [guest, setGuest] = useState({
    firstName: nameParts.first,
    lastName: nameParts.last,
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Sync guest form when user profile loads (async fetch after mount)
  useEffect(() => {
    if (user?.full_name || user?.email) {
      const parts = (user.full_name || "").trim().split(" ");
      setGuest((g) => ({
        firstName: g.firstName || parts[0] || "",
        lastName: g.lastName || parts.slice(1).join(" ") || "",
        email: g.email || user.email || "",
        phone: g.phone || user.phone || "",
      }));
    }
  }, [user]);

  const [dates, setDates] = useState({ checkIn: preCheckIn, checkOut: preCheckOut, adults: preGuests, children: 0, rooms: 1, pets: false, specialRequests: "" });
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvv: "" });

  const nights =
    dates.checkIn && dates.checkOut
      ? Math.max(1, Math.round((new Date(dates.checkOut) - new Date(dates.checkIn)) / 86400000))
      : 1;
  const total = pricePerNight * nights;
  const progressPercent = ((step - 1) / (steps.length - 1)) * 100;

  function validatePayment() {
    const digits = payment.cardNumber.replace(/\s/g, "");
    if (digits.length < 13 || digits.length > 19) return "Please enter a valid card number.";
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) return "Expiry must be in MM/YY format.";
    const [mm, yy] = payment.expiry.split("/").map(Number);
    const now = new Date();
    const expDate = new Date(2000 + yy, mm - 1, 1);
    if (mm < 1 || mm > 12 || expDate < new Date(now.getFullYear(), now.getMonth(), 1)) return "Card has expired or expiry is invalid.";
    if (payment.cvv.length < 3) return "CVV must be 3 or 4 digits.";
    return null;
  }

  async function handleConfirm() {
    if (!roomId) { setError("No room selected. Please go back and choose a room."); return; }
    if (!dates.checkIn || !dates.checkOut) { setError("Please select check-in and check-out dates."); return; }
    const payErr = validatePayment();
    if (payErr) { setError(payErr); return; }

    setLoading(true);
    setError("");
    try {
      const bookingRes = await createBooking({
        room_id: roomId,
        check_in: dates.checkIn,
        check_out: dates.checkOut,
        special_requests: dates.specialRequests || undefined,
      });
      const booking = bookingRes.data;
      await makePayment({ booking_id: booking.id, amount: booking.total_price, method: "card", currency: "USD" });
      navigate(`/booking-confirmation?booking_id=${booking.id}`, {
        state: {
          room: roomFromState,
          bookingId: booking.id,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guests: dates.adults + dates.children,
          total: booking.total_price ?? total,
        },
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow mt-8 mb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{t("booking_page.title")}</h1>
          <p className="text-on-surface-variant text-lg font-medium">{t("booking_page.subtitle")}</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>{error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* Step indicator */}
            <div className="flex items-center justify-between relative isolate">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-outline-variant z-0" />
              <div className="absolute top-5 left-5 h-0.5 bg-primary z-0 transition-all duration-500" style={{ width: `calc(${progressPercent / 100} * (100% - 2.5rem))` }} />
              {steps.map((s) => (
                <button key={s.num} type="button" onClick={() => step > s.num && setStep(s.num)} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s.num ? "bg-primary text-white shadow-lg shadow-primary/20" : step > s.num ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                    {step > s.num ? <span className="material-symbols-outlined text-sm">check</span> : s.num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${step === s.num ? "text-on-surface" : "text-on-surface-variant"}`}>{s.label}</span>
                </button>
              ))}
            </div>

            {step === 1 && (
              <section className="bg-surface-bright p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-8"><span className="material-symbols-outlined text-primary">person</span><h2 className="text-2xl font-extrabold">{t("booking_page.step1.title")}</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[{ label: t("booking_page.step1.first_name"), key: "firstName", placeholder: "John", type: "text" }, { label: t("booking_page.step1.last_name"), key: "lastName", placeholder: "Doe", type: "text" }, { label: t("booking_page.step1.email"), key: "email", placeholder: "john@example.com", type: "email" }, { label: t("booking_page.step1.phone"), key: "phone", placeholder: "+1 (555) 000-0000", type: "tel" }].map(({ label, key, placeholder, type }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
                      <input className="bg-transparent border-0 border-b border-outline-variant focus:border-primary py-2 text-sm font-semibold outline-none transition-colors" placeholder={placeholder} type={type} value={guest[key]} onChange={(e) => setGuest({ ...guest, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(2)} type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">{t("booking_page.common.continue")} <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="bg-surface-bright p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-8"><span className="material-symbols-outlined text-primary">calendar_month</span><h2 className="text-2xl font-extrabold">{t("booking_page.step2.title")}</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <DateRangePicker
                      checkIn={dates.checkIn}
                      checkOut={dates.checkOut}
                      onChange={({ checkIn, checkOut }) => setDates({ ...dates, checkIn, checkOut })}
                      label={`${t("booking_page.step2.check_in")} — ${t("booking_page.step2.check_out")}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step2.guests")}</label>
                    <GuestsPicker
                      adults={dates.adults}
                      children={dates.children}
                      rooms={dates.rooms}
                      pets={dates.pets}
                      onChange={({ adults, children, rooms, pets }) => setDates({ ...dates, adults, children, rooms, pets })}
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step2.special_requests")}</label>
                    <textarea rows={3} value={dates.specialRequests} onChange={(e) => setDates({ ...dates, specialRequests: e.target.value })} placeholder={t("booking_page.step2.special_requests_placeholder")} className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm font-semibold outline-none resize-none" />
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} type="button" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2"><span className="material-symbols-outlined text-sm">arrow_back</span>{t("booking_page.common.back")}</button>
                  <button onClick={() => setStep(3)} type="button" disabled={!dates.checkIn || !dates.checkOut} className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">{t("booking_page.common.continue")} <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-surface-bright p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-8"><span className="material-symbols-outlined text-primary">payments</span><h2 className="text-2xl font-extrabold">{t("booking_page.step3.payment_method")}</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step3.card_number")}</label>
                    <input maxLength={19} value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim() })} placeholder="•••• •••• •••• ••••" type="text" className="bg-transparent border-0 border-b border-outline-variant focus:border-primary py-2 text-sm font-semibold outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step3.expiry_date")}</label>
                    <input maxLength={5} value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM/YY" type="text" className="bg-transparent border-0 border-b border-outline-variant focus:border-primary py-2 text-sm font-semibold outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step3.cvv")}</label>
                    <input maxLength={4} value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g,"") })} placeholder="•••" type="password" className="bg-transparent border-0 border-b border-outline-variant focus:border-primary py-2 text-sm font-semibold outline-none transition-colors" />
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(2)} type="button" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2"><span className="material-symbols-outlined text-sm">arrow_back</span>{t("booking_page.common.back")}</button>
                  <button onClick={handleConfirm} disabled={loading} type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">
                    {loading ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Processing…</> : <>{t("booking_page.common.confirm_booking")} <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-start-3">
            <div className="sticky top-28 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden">
              <div className="h-44 relative overflow-hidden">
                {roomFromState?.image ? (
                  <img src={roomFromState.image} alt={roomName} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary/30">hotel</span>
                  </div>
                )}
                {roomFromState?.category && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{roomFromState.category}</span>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-5">
                <h3 className="font-extrabold text-lg">{roomName}</h3>
                <div className="space-y-3 border-b border-outline-variant/30 pb-5">
                  <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Check-in</span><span className="font-bold">{dates.checkIn || "—"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Check-out</span><span className="font-bold">{dates.checkOut || "—"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Guests</span><span className="font-bold">{dates.adults + dates.children}</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-on-surface-variant">${pricePerNight} × {nights} night{nights !== 1 ? "s" : ""}</span><span className="font-semibold">${total.toLocaleString()}</span></div>
                </div>
                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</p>
                    <p className="text-3xl font-extrabold">${total.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant">USD incl. taxes</span>
                </div>
                <p className="text-center text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">
                  <span className="material-symbols-outlined text-xs align-middle mr-1">lock</span>Secure Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
