import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Package, Star, Plus, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../search/CommandPalette';
import { LightboxViewer } from '../assets/LightboxViewer';
import { useApp } from '../../contexts/AppContext';

export const AppLayout = ({ children, onOpenAddProduct }) => {
  const { activeLightboxAsset, setActiveLightboxAsset, favorites } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isProductsActive = location.pathname === '/' || location.pathname === '/products' || location.pathname === '/assets';
  const isFavActive = location.pathname === '/favorites';
  const isSettingsActive = location.pathname === '/settings';

  return (
    <div className="flex h-screen bg-[#F6F8F7] dark:bg-[#0A0F0D] overflow-hidden select-none">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenAddProduct={onOpenAddProduct}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile App Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1512]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-emerald-950/80 px-4 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/products"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
            isProductsActive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </NavLink>

        <button
          onClick={onOpenAddProduct}
          className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 border-4 border-white dark:border-[#0E1512] active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="mt-0.5">Add</span>
        </button>

        <NavLink
          to="/favorites"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all relative ${
            isFavActive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <div className="relative">
            <Star className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                {favorites.length}
              </span>
            )}
          </div>
          <span>Favorites</span>
        </NavLink>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Global Lightbox Viewer */}
      {activeLightboxAsset && (
        <LightboxViewer
          initialAssetId={activeLightboxAsset.id}
          onClose={() => setActiveLightboxAsset(null)}
        />
      )}
    </div>
  );
};

