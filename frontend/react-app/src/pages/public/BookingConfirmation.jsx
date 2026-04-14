import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import parisImage from "../../assets/images/paris_1.png";
const nextStepIcons = ["mail", "luggage", "support_agent"];

export default function BookingConfirmation() {
  const { t } = useTranslation("pub_translation");
  const details = [
    { label: t("booking_page.step2.check_in"), value: t("booking_confirmation.details.check_in") },
    { label: t("booking_page.step2.check_out"), value: t("booking_confirmation.details.check_out") },
    { label: t("booking_page.common.guests"), value: t("booking_confirmation.details.guests") },
    { label: t("booking_confirmation.common.room_type"), value: t("booking_confirmation.details.room_type") },
  ];
  const nextSteps = t("booking_confirmation.next_steps.steps", { returnObjects: true });
  const splitStepText = (text) => {
    const separator = " - ";
    const index = text.indexOf(separator);
    if (index === -1) {
      return { title: text, description: "" };
    }
    return {
      title: text.slice(0, index),
      description: text.slice(index + separator.length),
    };
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Nav */}
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

      <main className="flex-grow py-16 px-6 max-w-4xl mx-auto w-full">

        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span
            className="material-symbols-outlined text-primary mb-5 animate-bounce"
            style={{ fontSize: "5rem", fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>

          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            {t("booking_confirmation.common.reference")} {t("booking_confirmation.reference")}
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3">
            {t("booking_confirmation.title")}
          </h1>
          <p className="text-on-surface-variant font-medium max-w-lg leading-relaxed">
            {t("booking_confirmation.message")}
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 overflow-hidden mb-10">
          <div className="grid md:grid-cols-5">
            {/* Image */}
            <div className="md:col-span-2 relative h-56 md:h-auto">
              <img
                alt="Azure Horizon Royal Suite"
                className="w-full h-full object-cover"
                src={parisImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary px-2 py-1 rounded text-white">
                  {t("booking_confirmation.common.location")}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-3 p-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">
                {t("booking_page.room_summary.room_name")}
              </h2>

              <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-6">
                {details.map((d) => (
                  <div key={d.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{d.label}</p>
                    <p className="text-sm font-bold text-on-surface">{d.value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("booking_confirmation.common.status")}</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t("booking_confirmation.details.status")}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("booking_confirmation.common.total_paid")}</p>
                  <p className="text-lg font-extrabold text-primary">{t("booking_confirmation.details.total_paid")}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
                <Link
                  to="/login"
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all text-center"
                >
                  {t("booking_confirmation.common.view_my_bookings")}
                </Link>
                <Link
                  to="/"
                  className="flex-1 border border-primary text-primary py-3 px-6 rounded-lg font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all text-center"
                >
                  {t("booking_confirmation.common.back_to_home")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center mb-6">
            {t("booking_confirmation.next_steps.title")}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((s, i) => {
              const stepText = splitStepText(s);
              return (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">{nextStepIcons[i]}</span>
                </div>
                <h4 className="font-bold text-sm text-on-surface mb-2">{stepText.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{stepText.description}</p>
              </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
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
