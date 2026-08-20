import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const Categories = () => {
  const { categories, products } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Product Categories
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Agricultural classification system for herbicides, fungicides, insecticides, PGR, fertilizers, and micronutrients.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = products.filter(
            (p) => (p.category_name || '').toLowerCase() === (cat.name || '').toLowerCase()
          ).length;

          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className="p-6 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs hover:border-emerald-600/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{count || cat.count} Products</span>
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
