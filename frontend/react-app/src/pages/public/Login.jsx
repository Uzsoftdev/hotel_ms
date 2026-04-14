import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import metaIcon from "../../assets/icons/meta.svg";
import appleIcon from "../../assets/icons/apple.svg";
import googleIcon from "../../assets/icons/google.svg";
import loginBack from "../../assets/images/login_back.png";

export default function Login() {
  const { t } = useTranslation("pub_translation");

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 lg:px-12 w-full">
          <div className="text-2xl font-extrabold tracking-tighter text-slate-900">{t("navigation.azure_horizon")}</div>
          <div className="flex items-center gap-6">
            <Link className="text-slate-600 font-semibold tracking-tight text-sm hover:text-blue-600 transition-colors" to="/">
              {t("navigation.home")}
            </Link>
            <Link className="px-5 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all" to="/register">
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
            <div className="mb-10 text-center">
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                {t("login_page.title")}
              </h1>
              <p className="font-medium text-on-surface-variant">{t("login_page.subtitle")}</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  {t("login_page.email_or_username")}
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3.5 text-sm font-semibold transition-all placeholder:text-slate-400 focus:border-primary focus:ring-0"
                  placeholder={t("login_page.email_placeholder")}
                  type="text"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-end justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                    {t("login_page.password")}
                  </label>
                  <Link className="text-[11px] font-bold text-primary hover:underline" to="/forgot-password">
                    {t("login_page.forgot_password")}
                  </Link>
                </div>
                <input
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3.5 text-sm font-semibold transition-all placeholder:text-slate-400 focus:border-primary focus:ring-0"
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <button
                className="w-full rounded-lg bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]"
                type="submit"
              >
                {t("login_page.login_button")}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-surface-bright px-4 text-on-surface-variant">{t("login_page.continue_with")}</span>
              </div>
            </div>

            <div className="mb-10 mt-4 grid grid-cols-3 gap-4">
              <button className="group flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-3 transition-colors active:scale-95 hover:bg-surface-container-low">
                <img
                  alt={t("login_page.providers.google")}
                  className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100"
                  src={googleIcon}
                />
              </button>
              <button className="group flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-3 transition-colors active:scale-95 hover:bg-surface-container-low">
                <img
                  alt={t("login_page.providers.apple")}
                  className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100"
                  src={appleIcon}
                />
              </button>
              <button className="group flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-3 transition-colors active:scale-95 hover:bg-surface-container-low">
                <img
                  alt={t("login_page.providers.meta")}
                  className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100"
                  src={metaIcon}
                />
              </button>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm font-medium text-on-surface-variant">
                {t("login_page.no_account")}
                <Link className="ml-1 font-bold text-primary hover:underline" to="/register">
                  {t("login_page.sign_up")}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
            <a className="hover:text-on-surface transition-colors" href="#">
              {t("footer.privacy_policy")}
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              {t("footer.terms_of_service")}
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              {t("footer.help_center")}
            </a>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden opacity-10">
        <img
          alt="blurred interior of a luxury minimalist hotel lobby with soft sunlight streaming through floor to ceiling windows and marble textures"
          className="h-full w-full scale-110 object-cover grayscale"
          src={loginBack}
        />
      </div>
    </div>
  );
}
