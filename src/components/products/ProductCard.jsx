import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FolderKanban, ChevronRight, Download, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useApp } from '../../contexts/AppContext';
import { downloadOriginalAsset } from '../../utils/downloadHelper';

export const ProductCard = ({ product, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { favorites, toggleFavoriteProduct, assets } = useApp();
  const isFav = favorites.includes(product.id);

  // Dynamically compute asset count for this product from the assets state
  const realAssetCount = assets.filter((a) => String(a.product_id) === String(product.id)).length;

  const handleDownloadCoverPhoto = (e) => {
    e.stopPropagation();
    downloadOriginalAsset(
      product.main_image_url,
      `${product.name.replace(/\s+/g, '_')}_Cover.jpg`,
      'image/jpeg'
    );
  };

  const handleCardClick = () => {
    const targetId = product.id || 'prod-1';
    navigate(`/products/${targetId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-600/50 dark:hover:border-emerald-600/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Image Header Container - object-contain & padded for full product bottle display */}
      <div className="relative aspect-4/3 bg-slate-100/60 dark:bg-[#16201C] overflow-hidden p-2 flex items-center justify-center">
        <img
          src={product.main_image_url}
          alt={product.name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
          loading="lazy"
        />

        {/* Favorite, Edit, Delete & Direct Download Overlays */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-1.5 rounded-lg bg-white/80 dark:bg-[#111815]/80 text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white transition-all backdrop-blur-md shadow-xs"
              title="Edit Product"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${product.name}"? This action will remove it from Supabase database.`)) {
                  onDelete(product.id);
                }
              }}
              className="p-1.5 rounded-lg bg-white/80 dark:bg-[#111815]/80 text-slate-600 dark:text-slate-200 hover:text-red-600 hover:bg-white transition-all backdrop-blur-md shadow-xs"
              title="Delete Product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDownloadCoverPhoto}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-[#111815]/80 text-slate-600 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white transition-all backdrop-blur-md shadow-xs"
            title="Download Original Product Cover Photo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteProduct(product.id);
            }}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isFav
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-[#111815]/80 text-slate-400 hover:text-amber-500 hover:bg-white'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Category Tag Overlay */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="brand" size="sm">
            {product.category_name}
          </Badge>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 sm:mt-1 font-medium leading-tight">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-medium">
            <FolderKanban className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span>{realAssetCount} Assets</span>
          </div>

          <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-slate-400 group-hover:text-emerald-700 font-semibold">
            Details <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
