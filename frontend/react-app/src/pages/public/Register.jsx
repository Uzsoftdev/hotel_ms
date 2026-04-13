import { Link } from "react-router-dom";
import register_back from "../../assets/images/register_back.png";
export default function Register() {


  
  return (
    <div className="bg-surface font-body text-on-surface flex flex-col min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-xl dark:shadow-none">
        <div className="flex justify-between items-center px-8 h-20 w-full">
          <div className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Azure Horizon</div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="font-plus-jakarta text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">
              Destinations
            </Link>
            <Link className="font-plus-jakarta text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">
              Experiences
            </Link>
            <Link className="font-plus-jakarta text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">
              Offers
            </Link>
          </div>
          <Link className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 duration-200 shadow-lg shadow-primary/20" to="/login">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-[600px] z-0">
        <img class="w-full h-full object-cover opacity-10 blur-sm" data-alt="Soft focused luxury hotel lobby with warm ambient lighting and marble textures creating a professional hospitality atmosphere" src={register_back} />
        <div class="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">Create your account</h1>
            <p className="text-on-surface-variant font-medium text-lg">Join Azure Horizon for exclusive luxury benefits and seamless bookings.</p>
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
                  <p className="font-bold text-lg">Upload Photo</p>
                  <p className="text-xs text-white/70 mt-1 uppercase tracking-widest">Recommended 400x400</p>
                </div>
              </div>

              <p className="mt-8 text-sm opacity-80 font-medium">
                &quot;Your journey to extraordinary destinations begins with a single step.&quot;
              </p>
            </div>

            <div className="w-full md:w-2/3 p-8 md:p-12">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="dateOfBirth">
                      Date of Birth
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
                      Origin Country
                    </label>
                    <select
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 transition-colors"
                      id="originCountry"
                      name="originCountry"
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>France</option>
                      <option>Japan</option>
                      <option>United Arab Emirates</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="phoneNumber">
                      Phone Number
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="emailAddress">
                      Email Address
                    </label>
                    <input
                      className="bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-sm font-bold py-2 placeholder:text-slate-300 transition-colors"
                      id="emailAddress"
                      name="emailAddress"
                      placeholder="john.doe@luxury.com"
                      type="email"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                      Password
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
                      Confirm Password
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
                      Stay inspired
                    </label>
                    <p className="text-on-surface-variant text-xs">
                      Receive curated travel guides and exclusive offers directly in your inbox.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:opacity-95 shadow-xl shadow-primary/30 transition-all active:scale-[0.98]"
                    type="submit"
                  >
                    Complete Registration
                  </button>

                  <p className="text-center mt-6 text-sm text-on-surface-variant font-medium">
                    Already have an account?
                    <Link className="text-primary font-bold hover:underline ml-1" to="/login">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <footer class="w-full py-12 mt-auto bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div class="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
        <div class="text-lg font-bold text-slate-900 dark:text-white">
                        Azure Horizon
                    </div>
        <div class="flex flex-wrap justify-center gap-8">
        <a class="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">Privacy Policy</a>
        <a class="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">Terms of Service</a>
        <a class="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">Cookie Policy</a>
        <a class="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#">Contact Us</a>
        </div>
        <div class="font-plus-jakarta text-xs font-medium uppercase tracking-widest text-slate-400 text-center md:text-right">
                        © 2024 Azure Horizon Luxury Hotels &amp; Resorts. All rights reserved.
                    </div>
        </div>
      </footer>
    </div>
  );
}
