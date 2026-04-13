import { Link } from "react-router-dom";
import metaIcon from "../../assets/icons/meta.svg";
import appleIcon from "../../assets/icons/apple.svg";
import googleIcon from "../../assets/icons/google.svg";
import login_back from "../../assets/images/login_back.png";

export default function Login() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 lg:px-12 w-full">
          <div className="text-2xl font-extrabold tracking-tighter text-slate-900">Azure Horizon</div>
          <div className="flex items-center gap-6">
            <Link className="text-slate-600 font-semibold tracking-tight text-sm hover:text-blue-600 transition-colors" to="/">
              Home
            </Link>
            <Link className="px-5 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all" to="/register">
              Sign Up
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
                Welcome Back
              </h1>
              <p className="font-medium text-on-surface-variant">Please enter your details to sign in</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  Email or Username
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3.5 text-sm font-semibold transition-all placeholder:text-slate-400 focus:border-primary focus:ring-0"
                  placeholder="Enter your email or username"
                  type="text"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-end justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                    Password
                  </label>
                  <a className="text-[11px] font-bold text-primary hover:underline" href="#">
                    Forgot Password?
                  </a>
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
                Login
              </button>
            </form>

          <div class="relative my-10">
            <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-outline-variant/50"></div>
            </div>
            <div class="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span class="bg-surface-bright px-4 text-on-surface-variant">or continue with</span>
            </div>
          </div>

          <div className="mb-10 mt-4 grid grid-cols-3 gap-4">
            <button className="group flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-3 transition-colors active:scale-95 hover:bg-surface-container-low">
              <img
                alt="Google"
                className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100"
                src={googleIcon}
              />
            </button>
            <button className="group flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-3 transition-colors active:scale-95 hover:bg-surface-container-low">
              <img
                alt="Apple"
                className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100"
                src={appleIcon}
              />
            </button>
            <button className="group flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-3 transition-colors active:scale-95 hover:bg-surface-container-low">
              <img
                alt="Meta"
                className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100"
                src={metaIcon}
              />
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm font-medium text-on-surface-variant">
              Don&apos;t have an account?
              <Link className="ml-1 font-bold text-primary hover:underline" to="/register">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
            <a className="hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              Help Center
            </a>
          </div>
        </div>
      </main>
      <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden opacity-10">
      <img
        alt="blurred interior of a luxury minimalist hotel lobby with soft sunlight streaming through floor to ceiling windows and marble textures"
        className="h-full w-full scale-110 object-cover grayscale"
        src={login_back}
      />
      </div>
  </div>
  );
}
