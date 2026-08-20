import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Plus,
  FolderArchive,
  Upload,
  Download,
  Pencil,
  Trash2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AssetCard } from '../components/assets/AssetCard';
import { EditProductModal } from '../components/ui/Modals';
import { downloadOriginalAsset } from '../utils/downloadHelper';
import JSZip from 'jszip';

export const ProductDetails = ({ onOpenAddAsset }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, assets, favorites, toggleFavoriteProduct, deleteProduct, setActiveLightboxAsset, deleteAsset } = useApp();

  // Find product by id or product_code
  const product = products.find((p) => String(p.id) === String(id) || String(p.product_code) === String(id));

  const [selectedAssetCategory, setSelectedAssetCategory] = useState('All');
  const [selectedPackingSize, setSelectedPackingSize] = useState('All');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [isZipping, setIsZipping] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action will permanently remove it from Supabase.`)) {
      await deleteProduct(product.id);
      navigate('/products');
    }
  };

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Product Not Found
        </h2>
        <p className="text-sm text-slate-500">The product you requested does not exist or was removed.</p>
        <Button variant="secondary" onClick={() => navigate('/products')}>
          Back to Products Catalog
        </Button>
      </div>
    );
  }

  const isFav = favorites.includes(product.id);

  // Filter Assets for this Product
  const productAssets = assets.filter((a) => String(a.product_id) === String(product.id));

  const filteredAssets = productAssets.filter((a) => {
    const matchesCat = selectedAssetCategory === 'All' || a.asset_type === selectedAssetCategory;
    const matchesSize = selectedPackingSize === 'All' || a.packing_size === selectedPackingSize || a.packing_size === 'All Sizes';
    return matchesCat && matchesSize;
  });

  const categoryCounts = {
    Packing: productAssets.filter((a) => a.asset_type === 'Packing').length,
    Label: productAssets.filter((a) => a.asset_type === 'Label').length,
    Material: productAssets.filter((a) => a.asset_type === 'Material').length,
    Creative: productAssets.filter((a) => a.asset_type === 'Creative').length,
    Video: productAssets.filter((a) => a.asset_type === 'Video').length,
    Document: productAssets.filter((a) => a.asset_type === 'Document').length,
  };

  const assetCategories = ['All', 'Packing', 'Label', 'Material', 'Creative', 'Video', 'Document'];

  const toggleSelectAsset = (assetId) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((i) => i !== assetId) : [...prev, assetId]
    );
  };

  const handleDownloadCoverPhoto = () => {
    downloadOriginalAsset(
      product.main_image_url,
      `${product.name.replace(/\s+/g, '_')}_Cover.jpg`,
      'image/jpeg'
    );
  };

  const handleBulkDownload = async () => {
    if (selectedAssetIds.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const selectedAssets = assets.filter((a) => selectedAssetIds.includes(a.id));

      for (const a of selectedAssets) {
        try {
          const resp = await fetch(a.file_url);
          const blob = await resp.blob();
          const ext = a.file_type?.includes('pdf') ? 'pdf' : 'jpg';
          zip.file(`${a.name}.${ext}`, blob);
        } catch (e) {
          zip.file(`${a.name}.url.txt`, `File URL: ${a.file_url}\nDescription: ${a.description || ''}`);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${product.name.replace(/\s+/g, '_')}_Assets.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Could not package ZIP automatically.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Mobile-Responsive Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
        </button>

        {/* Action Buttons wrapped gracefully for mobile screens */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setIsEditOpen(true)}>
            Edit <span className="hidden xs:inline">Product</span>
          </Button>

          <button
            onClick={handleDeleteProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold transition-all"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Delete</span>
          </button>

          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadCoverPhoto}>
            <span className="hidden xs:inline">Download</span> Image
          </Button>

          <button
            onClick={() => toggleFavoriteProduct(product.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-bold transition-all ${
              isFav
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-[#111815] border-slate-200 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-current text-amber-500' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          <Button variant="primary" size="sm" icon={Plus} onClick={() => onOpenAddAsset(product.id)}>
            Upload Asset
          </Button>
        </div>
      </div>

      {/* Product Hero Info Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Left Main Product Image Container - Using object-contain and padding so the whole bottle/pack fits cleanly */}
        <div className="w-full md:w-64 h-64 sm:h-72 shrink-0 rounded-2xl bg-slate-100/60 dark:bg-[#16201C] overflow-hidden border border-slate-200/80 dark:border-emerald-950/80 relative group p-3 flex items-center justify-center">
          <img
            src={product.main_image_url}
            alt={product.name}
            className="max-w-full max-h-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white p-4">
            <button
              onClick={handleDownloadCoverPhoto}
              className="p-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Image
            </button>
          </div>
        </div>

        {/* Right Detail Content */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{product.category_name}</Badge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {product.name}
            </h1>
          </div>

          {product.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quick Category Asset Breakdown Cards */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
            {assetCategories.slice(1).map((cat) => (
              <div
                key={cat}
                onClick={() => setSelectedAssetCategory(cat)}
                className={`p-2 sm:p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  selectedAssetCategory === cat
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-[#16201C] border-slate-200 dark:border-emerald-950/60 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] sm:text-xs block font-bold truncate">
                  {cat === 'Packing' && '📦 Packing'}
                  {cat === 'Label' && '🏷 Labels'}
                  {cat === 'Material' && '🧪 Material'}
                  {cat === 'Creative' && '🎨 Creative'}
                  {cat === 'Video' && '▶ Videos'}
                  {cat === 'Document' && '📄 PDFs'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {categoryCounts[cat] || 0} files
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Gallery Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {product.name} Asset Library ({filteredAssets.length})
          </h2>

          {/* Bulk Selection Bar */}
          {selectedAssetIds.length > 0 && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span>{selectedAssetIds.length} Selected</span>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={async () => {
                  if (window.confirm(`Delete these ${selectedAssetIds.length} assets? This cannot be undone.`)) {
                    try {
                      await Promise.all(selectedAssetIds.map(id => deleteAsset(id)));
                      setSelectedAssetIds([]);
                    } catch (err) {
                      alert('Failed to delete assets. They may not be synced to the database yet or there is a network error.');
                    }
                  }
                }}
              >
                Delete Selected
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={FolderArchive}
                disabled={isZipping}
                onClick={handleBulkDownload}
              >
                {isZipping ? 'Zipping...' : 'Download ZIP'}
              </Button>
              <button
                onClick={() => setSelectedAssetIds([])}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 ml-2"
              >
                Deselect
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-emerald-950/60">
          {assetCategories.map((cat) => {
            const isActive = selectedAssetCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedAssetCategory(cat)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white dark:bg-[#16201C] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-emerald-950/80 hover:border-slate-300'
                }`}
              >
                {cat === 'Packing' && '📦 '}
                {cat === 'Label' && '🏷 '}
                {cat === 'Material' && '🧪 '}
                {cat === 'Creative' && '🎨 '}
                {cat === 'Video' && '▶ '}
                {cat === 'Document' && '📄 '}
                {cat} Assets
              </button>
            );
          })}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedAssetIds.includes(asset.id)}
              onToggleSelect={toggleSelectAsset}
              onPreview={(a) => setActiveLightboxAsset(a)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 rounded-2xl p-8 space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No assets linked for {product.name} under {selectedAssetCategory === 'All' ? 'this filter' : selectedAssetCategory}.
          </p>
        </div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        product={product}
      />
    </div>
  );
};
