import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import registerBack from "../../assets/images/register_back.png";

export default function Register() {
  const { t } = useTranslation("pub_translation");

  return (
    <div className="bg-surface font-body text-on-surface flex flex-col min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-xl dark:shadow-none">
        <div className="flex justify-between items-center px-8 h-20 w-full">
          <div className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">{t("navigation.azure_horizon")}</div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="font-plus-jakarta text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">
              {t("register_page.destinations")}
            </Link>
            <Link className="font-plus-jakarta text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">
              {t("register_page.experiences")}
            </Link>
            <Link className="font-plus-jakarta text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">
              {t("register_page.offers")}
            </Link>
          </div>
          <Link className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 duration-200 shadow-lg shadow-primary/20" to="/login">
            {t("register_page.sign_in")}
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] z-0">
          <img className="w-full h-full object-cover opacity-10 blur-sm" data-alt="Soft focused luxury hotel lobby with warm ambient lighting and marble textures creating a professional hospitality atmosphere" src={registerBack} />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">{t("register_page.title")}</h1>
            <p className="text-on-surface-variant font-medium text-lg">{t("register_page.subtitle")}</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-primary p-8 text-white flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md overflow-hidden">
                    <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                      account_circle
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white text-primary rounded-full p-2 shadow-lg">
                    <span className="material-symbols-outlined text-sm">add_a_photo</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg">{t("register_page.upload_photo")}</p>
                  <p className="text-xs text-white/70 mt-1 uppercase tracking-widest">{t("register_page.photo_hint")}</p>
                </div>
              </div>

              <p className="mt-8 text-sm opacity-80 font-medium">
                &quot;{t("register_page.quote")}&quot;
              </p>
            </div>

            <div className="w-full md:w-2/3 p-8 md:p-12">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="firstName">
                      {t("register_page.form.first_name")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="firstName"
                      name="firstName"
                      placeholder={t("register_page.form.first_name_placeholder")}
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="lastName">
                      {t("register_page.form.last_name")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="lastName"
                      name="lastName"
                      placeholder={t("register_page.form.last_name_placeholder")}
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="dateOfBirth">
                      {t("register_page.form.date_of_birth")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 transition-colors"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="originCountry">
                      {t("register_page.form.origin_country")}
                    </label>
                    <select
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 transition-colors"
                      id="originCountry"
                      name="originCountry"
                    >
                      <option>{t("register_page.form.country_options.us")}</option>
                      <option>{t("register_page.form.country_options.uk")}</option>
                      <option>{t("register_page.form.country_options.france")}</option>
                      <option>{t("register_page.form.country_options.japan")}</option>
                      <option>{t("register_page.form.country_options.uae")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="phoneNumber">
                      {t("register_page.form.phone")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder={t("register_page.form.phone_placeholder")}
                      type="tel"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="emailAddress">
                      {t("register_page.form.email")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="emailAddress"
                      name="emailAddress"
                      placeholder={t("register_page.form.email_placeholder")}
                      type="email"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                      {t("register_page.form.password")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="confirmPassword">
                      {t("register_page.form.confirm_password")}
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <div className="flex items-center h-5">
                    <input
                      className="h-5 w-5 rounded border-outline text-primary focus:ring-primary/20 transition-all"
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                    />
                  </div>
                  <div className="text-sm">
                    <label className="font-semibold text-on-surface" htmlFor="newsletter">
                      {t("register_page.newsletter_title")}
                    </label>
                    <p className="text-on-surface-variant text-xs">
                      {t("register_page.newsletter_desc")}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:opacity-95 shadow-xl shadow-primary/30 transition-all active:scale-[0.98]"
                    type="submit"
                  >
                    {t("register_page.complete_registration")}
                  </button>

                  <p className="text-center mt-6 text-sm text-on-surface-variant font-medium">
                    {t("register_page.already_have_account")}
                    <Link className="text-primary font-bold hover:underline ml-1" to="/login">
                      {t("register_page.sign_in")}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-12 mt-auto bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {t("navigation.azure_horizon")}
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">{t("footer.privacy_policy")}</a>
            <a className="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">{t("footer.terms_of_service")}</a>
            <a className="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">{t("register_page.cookie_policy")}</a>
            <a className="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">{t("register_page.contact_us")}</a>
          </div>
          <div className="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
            {t("register_page.copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
