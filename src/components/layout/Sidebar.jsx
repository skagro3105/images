import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Package,
  Star,
  Settings,
  X,
  Sprout,
  Plus
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen, onOpenAddProduct }) => {
  const location = useLocation();
  const { favorites } = useApp();

  const navItems = [
    { label: 'Products & Assets', path: '/', icon: Package },
    { label: 'Favorites', path: '/favorites', icon: Star, badge: favorites.length },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-white dark:bg-[#0E1512] border-r border-slate-200/80 dark:border-emerald-950/40 transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-emerald-950/40">
          <NavLink to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2 min-w-0">
            <img
              src="sk-agro-logo.jpg"
              alt="S K Agro Chemical"
              className="h-9 w-9 object-contain rounded-lg shrink-0 bg-white p-0.5"
            />
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-none truncate">
                S K AGRO
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase block mt-0.5 truncate">
                CHEMICAL
              </span>
            </div>
          </NavLink>

          {/* Close for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Action for Mobile & Desktop */}
        <div className="p-3">
          <button
            onClick={() => {
              setIsMobileOpen(false);
              onOpenAddProduct();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-semibold text-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {/* Essential Clean Navigation */}
        <div className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/' && (location.pathname === '/products' || location.pathname === '/assets'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-[#15201B] text-[#0F5132] dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#121A16] hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#0F5132] dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate flex-1">{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};
