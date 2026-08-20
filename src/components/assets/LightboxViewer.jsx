import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { downloadOriginalAsset } from '../../utils/downloadHelper';

export const LightboxViewer = ({ assetList = [], initialAssetId, onClose }) => {
  const { assets: globalAssets, deleteAsset } = useApp();
  const list = assetList.length > 0 ? assetList : globalAssets;
  
  const initialIndex = list.findIndex((a) => a.id === initialAssetId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentAsset = list[currentIndex];

  if (!currentAsset) return null;

  const handleNext = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const handlePrev = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAsset.file_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadOriginalAsset(currentAsset.file_url, currentAsset.name, currentAsset.file_type);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete asset "${currentAsset.name}"?`)) {
      try {
        await deleteAsset(currentAsset.id);
        onClose();
      } catch (err) {
        alert('Failed to delete asset. It may not be synced yet.');
      }
    }
  };

  // Prevent background scrolling
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        {/* Asset Info */}
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-white font-bold text-lg truncate">
            {currentAsset.name}
          </h3>
          <p className="text-xs text-slate-400 truncate">
            {currentAsset.product_name} • {currentAsset.asset_type}
          </p>
        </div>

        {/* Counter */}
        <div className="text-xs font-semibold px-3 py-1 bg-slate-800 rounded-full text-slate-300 mr-4">
          {currentIndex + 1} / {list.length}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={copied ? Check : Copy}
            onClick={handleCopyLink}
            className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hidden sm:flex"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-none"
            icon={Trash2}
            onClick={handleDelete}
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={Download}
            onClick={handleDownload}
          >
            <span className="hidden sm:inline">Download</span>
          </Button>

          <button
            onClick={onClose}
            className="ml-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewer Area */}
      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
        {/* Navigation Left */}
        {list.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-lg transition-all hover:scale-105"
            title="Previous Asset"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Display Image or PDF preview */}
        <div className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }}>
          {currentAsset.file_type?.includes('pdf') ? (
            <div className="w-[700px] h-[500px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <span className="text-4 font-bold text-emerald-400 bg-emerald-950/60 px-4 py-2 rounded-lg border border-emerald-800/80 mb-4">
                PDF DOCUMENT
              </span>
              <p className="text-lg font-semibold text-white mb-2">{currentAsset.name}</p>
              <p className="text-sm text-slate-400 mb-6">{currentAsset.description}</p>
              <a
                href={currentAsset.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Open Full Document <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <img
              src={currentAsset.file_url}
              alt={currentAsset.name}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {/* Navigation Right */}
        {list.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-lg transition-all hover:scale-105"
            title="Next Asset"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Metadata & Controls Bar */}
      <div className="h-16 px-6 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="text-xs text-slate-400 flex items-center gap-4">
          <span>Format: <strong className="text-slate-200">{currentAsset.file_type || 'image/jpeg'}</strong></span>
          <span>Size: <strong className="text-slate-200">{currentAsset.file_size || '3.5 MB'}</strong></span>
          {currentAsset.gdrive_file_id && (
            <span className="hidden sm:inline">Drive ID: <strong className="text-slate-200 font-mono">{currentAsset.gdrive_file_id}</strong></span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1 text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1 text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
