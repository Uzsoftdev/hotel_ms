import { useTheme } from '../../../contexts/ThemeContext';
import AdminLayout from '../Layout/AdminLayout';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Settings</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage your admin preferences</p>
        </div>

        {/* Appearance */}
        <section className="rounded-xl border border-outline-variant/30 bg-surface-bright p-6 space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface-variant">Appearance</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">Theme</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Choose between light and dark mode</p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'bg-white shadow text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-700 shadow text-white'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                Dark
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[16px]">person</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Admin User</p>
                <p className="text-xs text-on-surface-variant">admin@allstay.com</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
