import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Image as ImageIcon, Star, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, products, assets } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isCommandPaletteOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredProducts = trimmed
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.active_ingredient.toLowerCase().includes(trimmed) ||
          p.formulation.toLowerCase().includes(trimmed) ||
          p.product_code.toLowerCase().includes(trimmed)
      )
    : products.slice(0, 4);

  const filteredAssets = trimmed
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(trimmed) ||
          a.asset_type.toLowerCase().includes(trimmed) ||
          a.packing_size.toLowerCase().includes(trimmed)
      )
    : assets.slice(0, 4);

  const handleSelectProduct = (id) => {
    setIsCommandPaletteOpen(false);
    navigate(`/products/${id}`);
  };

  const handleSelectAsset = (asset) => {
    setIsCommandPaletteOpen(false);
    navigate(`/products/${asset.product_id}`);
  };

  const handleNavigation = (path) => {
    setIsCommandPaletteOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-emerald-950/80 text-left shadow-2xl transition-all">
        {/* Search Input */}
        <div className="relative border-b border-slate-100 dark:border-emerald-950/60 px-4 flex items-center">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a product name, formulation, asset or command..."
            className="w-full bg-transparent py-4 text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-[#16201C] rounded text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!trimmed && (
            <div>
              <p className="px-3 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Quick Navigation
              </p>
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => handleNavigation('/products')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#16201C] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    <span>Browse All Products</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleNavigation('/favorites')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#16201C] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>View Favorited Items</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Products ({filteredProducts.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-[#16201C] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.main_image_url}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 dark:border-emerald-950/80"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {p.active_ingredient} • {p.category_name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                      View →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAssets.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Assets ({filteredAssets.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredAssets.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleSelectAsset(a)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-[#16201C] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {a.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {a.product_name} • {a.asset_type} ({a.packing_size})
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 shrink-0">
                      Open
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-emerald-950/60 px-4 py-2.5 bg-slate-50 dark:bg-[#0A0F0D] flex items-center justify-between text-xs text-slate-400">
          <span>Navigate with arrows or click item</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
