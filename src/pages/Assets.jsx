import React, { useState } from 'react';
import { Search, FolderKanban, Plus, FolderArchive } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AssetCard } from '../components/assets/AssetCard';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import JSZip from 'jszip';

export const Assets = ({ onOpenAddAsset }) => {
  const { assets, setActiveLightboxAsset, deleteAsset } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [isZipping, setIsZipping] = useState(false);

  const filteredAssets = assets.filter((a) => {
    const name = (a.name || '').toLowerCase();
    const productName = (a.product_name || '').toLowerCase();
    const packingSize = (a.packing_size || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      name.includes(q) ||
      productName.includes(q) ||
      packingSize.includes(q);

    const matchesType = selectedType === 'All' || a.asset_type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleSelectAsset = (id) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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
          zip.file(`${a.name}.url.txt`, `File URL: ${a.file_url}`);
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `SK_Agro_Assets_Selection.zip`;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Asset Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Central repository for all packing images, statutory labels, videos, and PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedAssetIds.length > 0 && (
            <>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={() => {
                  if (window.confirm(`Delete these ${selectedAssetIds.length} assets? This cannot be undone.`)) {
                    selectedAssetIds.forEach(id => deleteAsset(id));
                    setSelectedAssetIds([]);
                  }
                }}
              >
                Delete Selected
              </Button>
              <Button
                variant="primary"
                icon={FolderArchive}
                disabled={isZipping}
                onClick={handleBulkDownload}
              >
                {isZipping ? 'Zipping...' : `Download ${selectedAssetIds.length} Assets`}
              </Button>
            </>
          )}
          <Button variant="primary" icon={Plus} onClick={onOpenAddAsset}>
            Link New Asset
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search asset filename, product name, size..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
        >
          <option value="All" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">All Types</option>
          <option value="Packing" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">📦 Packing Photos</option>
          <option value="Label" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">🏷 Labels</option>
          <option value="Material" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">🧪 Material</option>
          <option value="Creative" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">🎨 Marketing</option>
          <option value="Video" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">▶ Videos</option>
          <option value="Document" className="bg-white dark:bg-[#16201C] text-slate-900 dark:text-slate-100">📄 Documents</option>
        </select>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          <FolderKanban className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No assets match your search criteria
          </h3>
          <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSelectedType('All'); }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export const Favorites = () => {
  const { products, assets, favorites, setActiveLightboxAsset } = useApp();

  const favProducts = products.filter((p) => favorites.includes(p.id));
  const favAssets = assets.filter((a) => favorites.includes(a.id));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Favorites
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quick access to your starred agricultural formulations and asset files.
        </p>
      </div>

      {/* Starred Products */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Starred Products ({favProducts.length})
        </h2>
        {favProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {favProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4">No products starred yet.</p>
        )}
      </div>

      {/* Starred Assets */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Starred Assets ({favAssets.length})
        </h2>
        {favAssets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {favAssets.map((a) => (
              <AssetCard key={a.id} asset={a} onPreview={(asset) => setActiveLightboxAsset(asset)} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4">No individual assets starred yet.</p>
        )}
      </div>
    </div>
  );
};

export const Recent = () => {
  const { products, assets, recentViewed, setActiveLightboxAsset } = useApp();

  const items = recentViewed
    .map((r) => {
      if (r.type === 'product') {
        const item = products.find((p) => p.id === r.id);
        return item ? { ...item, _recentType: 'product', timestamp: r.timestamp } : null;
      } else {
        const item = assets.find((a) => a.id === r.id);
        return item ? { ...item, _recentType: 'asset', timestamp: r.timestamp } : null;
      }
    })
    .filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Recently Viewed
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          History of product pages and assets opened in this session.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          item._recentType === 'product' ? (
            <ProductCard key={`rec-${item.id}`} product={item} />
          ) : (
            <AssetCard key={`rec-${item.id}`} asset={item} onPreview={(a) => setActiveLightboxAsset(a)} />
          )
        ))}
      </div>
    </div>
  );
};
