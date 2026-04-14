import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import loginBack from "../../assets/images/login_back.png";

export default function ForgotPassword() {
  const { t } = useTranslation("pub_translation");

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 lg:px-12 w-full">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-slate-900">{t("navigation.azure_horizon")}</Link>
          <div className="flex items-center gap-6">
            <Link className="text-slate-600 font-semibold text-sm hover:text-primary transition-colors" to="/">{t("navigation.home")}</Link>
            <Link className="px-5 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all" to="/register">
              {t("navigation.sign_up")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow relative overflow-hidden flex items-center justify-center pt-16">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-[10%] -left-[5%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[60%] -right-[5%] h-[30%] w-[30%] rounded-full bg-blue-300/20 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-[480px] px-6 py-12">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-bright p-8 shadow-2xl backdrop-blur-sm md:p-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">{t("forgot_password_page.title")}</h1>
              <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto">
                {t("forgot_password_page.subtitle")}
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  {t("forgot_password_page.email_label")}
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3.5 text-sm font-semibold transition-all placeholder:text-slate-400 focus:border-primary focus:ring-0 outline-none"
                  placeholder={t("forgot_password_page.email_placeholder")}
                  type="email"
                  required
                />
              </div>

              <button
                className="w-full rounded-lg bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-px active:scale-95"
                type="submit"
              >
                {t("forgot_password_page.send_reset_link")}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <Link
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
                to="/login"
              >
                <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                {t("forgot_password_page.back_to_sign_in")}
              </Link>
              <p className="text-xs font-medium text-on-surface-variant">
                {t("forgot_password_page.no_account")} {" "}
                <Link className="font-bold text-primary hover:underline" to="/register">
                  {t("forgot_password_page.create_one")}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
            <a className="hover:text-on-surface transition-colors" href="#">{t("footer.privacy_policy")}</a>
            <a className="hover:text-on-surface transition-colors" href="#">{t("footer.terms_of_service")}</a>
            <a className="hover:text-on-surface transition-colors" href="#">{t("footer.help_center")}</a>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden opacity-10">
        <img
          alt="Blurred luxury hotel lobby interior"
          className="h-full w-full scale-110 object-cover grayscale"
          src={loginBack}
        />
      </div>
    </div>
  );
}
