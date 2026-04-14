import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import parisImage from "../../assets/images/paris_1.png";

export default function Booking() {
  const { t } = useTranslation("pub_translation");
  const steps = [
    { num: 1, label: t("booking_page.step_indicator.step1"), icon: "person" },
    { num: 2, label: t("booking_page.step_indicator.step2"), icon: "calendar_month" },
    { num: 3, label: t("booking_page.step_indicator.step3"), icon: "payments" },
  ];

  const summary = {
    room: t("booking_page.room_summary.room_name"),
    type: t("booking_page.room_summary.type"),
    checkIn: t("booking_page.room_summary.check_in"),
    checkOut: t("booking_page.room_summary.check_out"),
    guests: t("booking_page.room_summary.guests"),
    ratePerNight: t("booking_page.price_breakdown.rate_per_night"),
    nights: t("booking_page.price_breakdown.nights"),
    resortFee: t("booking_page.price_breakdown.resort_fee"),
    discount: Math.abs(t("booking_page.price_breakdown.discount")),
  };

  const [step, setStep] = useState(1);
  const subtotal = summary.ratePerNight * summary.nights;
  const total = subtotal + summary.resortFee - summary.discount;
  const progressPercent = ((step - 1) / (steps.length - 1)) * 100;
  const progressLabel = Math.round(progressPercent);
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("navigation.home")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">{t("navigation.rooms")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/about">{t("navigation.about")}</Link>
            <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("navigation.contact")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link className="bg-transparent border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/register">{t("navigation.register")}</Link>
            <Link className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20" to="/login">{t("navigation.login")}</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow mt-8 mb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">{t("booking_page.title")}</h1>
          <p className="text-on-surface-variant text-lg font-medium">{t("booking_page.subtitle")}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between relative isolate">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-outline-variant z-0" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-primary z-0 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />

              {steps.map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s.num
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : step > s.num
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-highest text-on-surface-variant"
                    }`}>
                    {step > s.num
                      ? <span className="material-symbols-outlined text-sm">check</span>
                      : s.num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${step === s.num ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {s.label}
                  </span>
                </button>
              ))}

              <span className="absolute -bottom-6 right-0 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {progressLabel}{t("booking_page.percent_complete")}
              </span>
            </div>

            {step === 1 && (
              <section className="bg-surface-bright p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h2 className="text-2xl font-extrabold tracking-tight">{t("booking_page.step1.title")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step1.first_name")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="John" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step1.last_name")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="Doe" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step1.email")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="john@example.com" type="email" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step1.phone")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="+1 (555) 000-0000" type="tel" />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(2)} type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                    {t("booking_page.common.continue")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="bg-surface-bright p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <h2 className="text-2xl font-extrabold tracking-tight">{t("booking_page.step2.title")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step2.check_in")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" type="date" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step2.check_out")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" type="date" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step2.guests")}</label>
                    <select className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors cursor-pointer">
                      <option>{t("booking_page.step2.guest_options.1")}</option>
                      <option>{t("booking_page.step2.guest_options.2")}</option>
                      <option>{t("booking_page.step2.guest_options.3")}</option>
                      <option>{t("booking_page.step2.guest_options.4")}</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step2.special_requests")}</label>
                    <textarea className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors resize-none" placeholder={t("booking_page.step2.special_requests_placeholder")} rows={3} />
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} type="button" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> {t("booking_page.common.back")}
                  </button>
                  <button onClick={() => setStep(3)} type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                    {t("booking_page.common.continue")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-surface-bright p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <h2 className="text-2xl font-extrabold tracking-tight">{t("booking_page.step3.payment_method")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step3.card_number")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="•••• •••• •••• ••••" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step3.expiry_date")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="MM / YY" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.step3.cvv")}</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2 text-sm font-semibold text-on-surface outline-none transition-colors" placeholder="•••" type="text" />
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(2)} type="button" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> {t("booking_page.common.back")}
                  </button>
                  <button type="button" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2" onClick={() => navigate("/booking-confirmation")}>
                    {t("booking_page.common.confirm_booking")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-start-3">
            <div className="sticky top-28 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden">
              <div className="h-40 w-full relative">
                <img alt={summary.room} className="w-full h-full object-cover" src={parisImage} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/30 backdrop-blur-md px-2 py-1 rounded">{summary.type}</span>
                  <h3 className="text-lg font-bold mt-1">{summary.room}</h3>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-3 border-b border-outline-variant/30 pb-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t("booking_page.common.dates")}</span>
                    <span className="font-bold">{summary.checkIn} - {summary.checkOut}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t("booking_page.common.guests")}</span>
                    <span className="font-bold">{summary.guests}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">${summary.ratePerNight} x {summary.nights} {t("booking_page.common.nights")}</span>
                    <span className="font-semibold">${subtotal.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t("booking_page.common.resort_fee")}</span>
                    <span className="font-semibold">${summary.resortFee}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-primary">
                    <span>{t("booking_page.common.loyalty_discount")}</span>
                    <span className="font-semibold">-${summary.discount}.00</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("booking_page.common.total_amount")}</p>
                    <p className="text-3xl font-extrabold tracking-tight text-on-surface">${total.toLocaleString()}.00</p>
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant">{t("booking_page.common.usd_incl_taxes")}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/booking-confirmation")}
                  className="w-full bg-primary text-white py-4 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t("booking_page.common.confirm_booking")}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>

                <p className="text-center text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">
                  <span className="material-symbols-outlined text-xs align-middle mr-1">lock</span>
                  {t("booking_page.common.secure_checkout")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/">{t("footer.quick_links.home")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/rooms">{t("footer.quick_links.rooms")}</Link>
            <Link className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" to="/contact">{t("footer.quick_links.contact")}</Link>
            <a className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">{t("footer.privacy_policy")}</a>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
