import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  FolderKanban,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/products/ProductCard';
import { AssetCard } from '../components/assets/AssetCard';
import { Button } from '../components/ui/Button';

export const Dashboard = ({ onOpenAddProduct, onOpenAddAsset }) => {
  const navigate = useNavigate();
  const { products, assets, categories, setActiveLightboxAsset } = useApp();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const featuredProducts = products.slice(0, 4);
  const recentAssets = assets.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Clean Minimal Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#121A16] border border-slate-200/80 dark:border-emerald-950/40 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            S K Agro Chemical Asset Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Quickly search, preview, and download packing photos, high-res labels, and PDF brochures.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAddAsset}
          >
            + Link Asset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddProduct}
          >
            + Add Product
          </Button>
        </div>
      </div>

      {/* Minimal Quick Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121A16] border border-slate-200/80 dark:border-emerald-950/40 shadow-xs space-y-3">
        <form onSubmit={handleQuickSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search product (e.g. Imaze Clear), ingredient, packing size (500ml)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#0A0F0D] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <Button type="submit" variant="primary" size="sm" className="px-5">
            Search
          </Button>
        </form>

        {/* Minimal Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Quick Filters:</span>
          {['Imaze Clear', 'Mancozeb 75%', '500ml', '1L Bottle', 'Labels'].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/products?search=${encodeURIComponent(tag)}`)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1B2721] hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> Products Catalog
          </h2>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
          >
            View All ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Recent Uploaded Assets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> Recent Assets
          </h2>
          <button
            onClick={() => navigate('/assets')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
          >
            Asset Library ({assets.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onPreview={(a) => setActiveLightboxAsset(a)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
