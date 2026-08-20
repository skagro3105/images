import React from 'react';
import {
  Download,
  Star,
  FileText,
  Video,
  Package,
  Tag,
  FlaskConical,
  Palette
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useApp } from '../../contexts/AppContext';
import { downloadOriginalAsset } from '../../utils/downloadHelper';

export const AssetCard = ({ asset, onPreview, isSelected, onToggleSelect }) => {
  const { favorites, toggleFavoriteAsset } = useApp();
  const isFav = favorites.includes(asset.id);

  const getAssetIcon = (type) => {
    switch (type) {
      case 'Packing': return Package;
      case 'Label': return Tag;
      case 'Material': return FlaskConical;
      case 'Creative': return Palette;
      case 'Video': return Video;
      default: return FileText;
    }
  };

  const IconComponent = getAssetIcon(asset.asset_type);

  const handleDownload = (e) => {
    e.stopPropagation();
    downloadOriginalAsset(asset.file_url, asset.name, asset.file_type);
  };

  return (
    <div
      className={`group relative bg-white dark:bg-[#111815] border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20'
          : 'border-slate-200/80 dark:border-emerald-950/60 hover:border-slate-300 dark:hover:border-emerald-900/60'
      }`}
    >
      {/* Thumbnail Area - Using object-contain and p-2 so full image bottle/pack fits inside cleanly */}
      <div
        onClick={() => onPreview && onPreview(asset)}
        className="relative aspect-4/3 bg-slate-100/60 dark:bg-[#16201C] overflow-hidden cursor-pointer p-2 flex items-center justify-center"
      >
        {asset.file_type?.includes('pdf') ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-100 dark:bg-[#16201C]">
            <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
              PDF DOCUMENT
            </span>
          </div>
        ) : (
          <img
            src={asset.preview_url || asset.file_url}
            alt={asset.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
            loading="lazy"
          />
        )}

        {/* Multi-select checkbox */}
        {onToggleSelect && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(asset.id);
            }}
            className="absolute top-3 left-3 z-10"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteAsset(asset.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all z-10 ${
            isFav
              ? 'bg-amber-500 text-white'
              : 'bg-white/70 dark:bg-[#111815]/70 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'
          }`}
          title="Favorite Asset"
        >
          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all transform group-hover:scale-105"
            title="Download Original Asset"
          >
            <Download className="w-4 h-4" /> Download Asset
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="brand" size="sm" icon={IconComponent}>
            {asset.asset_type}
          </Badge>
        </div>

        <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {asset.name}
        </h4>

        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-emerald-950/60 text-[10px] sm:text-[11px] text-slate-400">
          <span className="truncate">{asset.product_name}</span>
          <span>{asset.file_size || '3.5 MB'}</span>
        </div>
      </div>
    </div>
  );
};
