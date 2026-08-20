import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Shield, Sun, Moon } from 'lucide-react';

export const Settings = () => {
  const { theme, toggleTheme } = useApp();

  return (
    <div className="max-w-3xl space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage system theme appearance and preference options.
        </p>
      </div>

      {/* Appearance Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-emerald-400" />}
          Theme Preference
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => toggleTheme('light')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                : 'border-slate-200 dark:border-emerald-950/80 bg-slate-50 dark:bg-[#16201C] text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            onClick={() => toggleTheme('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-emerald-600 bg-emerald-950/60 text-emerald-300 ring-2 ring-emerald-500/20 font-bold'
                : 'border-slate-200 dark:border-emerald-950/80 bg-slate-50 dark:bg-[#16201C] text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Moon className="w-6 h-6 text-emerald-400" />
            <span className="text-xs">Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Mobile App Installation (PWA / APK) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          📱 Install Mobile App (APK / Home Screen)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          This web app is configured as a Progressive Web App (PWA). Adding it to your mobile Home Screen installs it directly onto your device with app icon, splash screen, and fullscreen app layout.
        </p>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-bold text-emerald-700 dark:text-emerald-400">How to install on Chrome / Android:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>Tap the <strong>3 dots (⋮)</strong> menu in Chrome browser.</li>
            <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
            <li>Confirm installation to install it directly on your mobile app launcher!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export const Admin = ({ onOpenAddProduct, onOpenAddAsset }) => {
  const { products, assets, user } = useApp();

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center text-slate-500">
        <Shield className="w-12 h-12 mx-auto text-red-500 mb-2" />
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-xs">You must be an administrator to access the admin portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Operations Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          CRUD management center for SK Agro products, asset metadata, and permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Catalog Management
          </h3>
          <p className="text-xs text-slate-500">
            Currently tracking <strong>{products.length}</strong> active products in database.
          </p>
          <Button variant="primary" onClick={onOpenAddProduct}>
            + Add New Product
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Asset Repository
          </h3>
          <p className="text-xs text-slate-500">
            Currently managing <strong>{assets.length}</strong> linked media files and documents in database.
          </p>
          <Button variant="secondary" onClick={onOpenAddAsset}>
            + Upload Asset
          </Button>
        </div>
      </div>
    </div>
  );
};
