import { Link } from "react-router-dom";
import loginBack from "../../assets/images/login_back.png";

export default function ForgotPassword() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 lg:px-12 w-full">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-slate-900">Azure Horizon</Link>
          <div className="flex items-center gap-6">
            <Link className="text-slate-600 font-semibold text-sm hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="px-5 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all" to="/register">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow relative overflow-hidden flex items-center justify-center pt-16">
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-[10%] -left-[5%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[60%] -right-[5%] h-[30%] w-[30%] rounded-full bg-blue-300/20 blur-[100px]" />
        </div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-[480px] px-6 py-12">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-bright p-8 shadow-2xl backdrop-blur-sm md:p-10">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Reset Password</h1>
              <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  Email Address
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3.5 text-sm font-semibold transition-all placeholder:text-slate-400 focus:border-primary focus:ring-0 outline-none"
                  placeholder="john@example.com"
                  type="email"
                  required
                />
              </div>

              <button
                className="w-full rounded-lg bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-px active:scale-95"
                type="submit"
              >
                Send Reset Link
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <Link
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
                to="/login"
              >
                <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                Back to Sign In
              </Link>
              <p className="text-xs font-medium text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <Link className="font-bold text-primary hover:underline" to="/register">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
            <a className="hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-on-surface transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-on-surface transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </main>

      {/* Background image */}
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
