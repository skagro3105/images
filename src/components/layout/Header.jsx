import React from 'react';
import { Search, Sun, Moon, Command, Menu, User, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Header = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme, user, setUser, setIsCommandPaletteOpen } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('sk_user');
    setUser(null);
  };

  return (
    <header className="h-14 sm:h-16 border-b border-slate-200/80 dark:border-emerald-950/40 bg-white/90 dark:bg-[#0E1512]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-3">
      {/* Mobile Brand */}
      <div className="flex items-center gap-2 md:hidden shrink-0">
        <img src="sk-agro-logo.jpg" alt="S K Agro Chemical" className="h-7 w-7 object-contain rounded bg-white p-0.5" />
      </div>

      {/* Global Search Button */}
      <div className="flex-1 max-w-xl min-w-0">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100/80 dark:bg-[#141E19] border border-slate-200/70 dark:border-emerald-950/60 text-slate-400 dark:text-slate-400 text-xs sm:text-sm hover:border-slate-300 dark:hover:border-emerald-900/60 transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
            <span className="truncate text-left text-xs sm:text-sm">Search product, label, PDF...</span>
          </div>

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0A0F0D] rounded border border-slate-200 dark:border-emerald-950 shrink-0">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Theme Switcher + User Profile Badge */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => toggleTheme()}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141E19] transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* User Profile Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-emerald-950/60">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141E19] border border-slate-200/80 dark:border-emerald-950/80">
              <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 capitalize leading-none">
                  {user.name || 'Admin User'}
                </span>
                <span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                  {user.role || 'Admin'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
