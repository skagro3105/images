import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, PackageX, FolderArchive } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/products/ProductCard';
import { AssetCard } from '../components/assets/AssetCard';
import { Button } from '../components/ui/Button';
import { EditProductModal } from '../components/ui/Modals';
import JSZip from 'jszip';

export const CatalogHub = ({ onOpenAddProduct, onOpenAddAsset }) => {
  const { products, assets, categories, setActiveLightboxAsset, deleteProduct, deleteAsset } = useApp();
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'assets'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedFormulation, setSelectedFormulation] = useState('all');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [isZipping, setIsZipping] = useState(false);

  // Formulations
  const formulations = useMemo(() => {
    const set = new Set(products.map((p) => p.formulation));
    return Array.from(set);
  }, [products]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const ingredient = (p.active_ingredient || '').toLowerCase();
      const code = (p.product_code || '').toLowerCase();
      const catName = (p.category_name || '').toLowerCase();
      const formulation = p.formulation || '';
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        name.includes(q) ||
        ingredient.includes(q) ||
        code.includes(q);

      const matchesCat =
        selectedCategory === 'all' ||
        catName === selectedCategory.toLowerCase() ||
        categories.find((c) => c.slug === selectedCategory)?.name?.toLowerCase() === catName;

      const matchesFormulation =
        selectedFormulation === 'all' || formulation === selectedFormulation;

      return matchesSearch && matchesCat && matchesFormulation;
    });
  }, [products, searchQuery, selectedCategory, selectedFormulation, categories]);

  // Filter Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const name = (a.name || '').toLowerCase();
      const productName = (a.product_name || '').toLowerCase();
      const packingSize = (a.packing_size || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        name.includes(q) ||
        productName.includes(q) ||
        packingSize.includes(q);

      const matchesType = selectedAssetType === 'all' || a.asset_type === selectedAssetType;
      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, selectedAssetType]);

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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Responsive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Product & Asset Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unified catalog for all S K Agro Chemical formulations, packing photos, labels, and technical files.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
          {activeTab === 'assets' && selectedAssetIds.length > 0 && (
            <>
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
                variant="primary"
                size="sm"
                icon={FolderArchive}
                disabled={isZipping}
                onClick={handleBulkDownload}
              >
                {isZipping ? 'Zipping...' : `ZIP (${selectedAssetIds.length})`}
              </Button>
            </>
          )}
          <Button variant="primary" size="sm" icon={Plus} onClick={onOpenAddProduct}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Main Switcher & Control Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 shadow-xs space-y-3 sm:space-y-4">
        {/* Toggle Between Products & All Files */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-emerald-950/60 pb-3 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#16201C] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📦 Products ({filteredProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'assets'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#16201C] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📁 All Files ({filteredAssets.length})
            </button>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedFormulation !== 'all' || selectedAssetType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFormulation('all');
                setSelectedAssetType('all');
                setSearchParams({});
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline self-end sm:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 sm:top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, active ingredient, size, or SKU..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug} className="bg-white dark:bg-[#16201C]">
                  {c.name}
                </option>
              ))}
            </select>

            {activeTab === 'assets' && (
              <select
                value={selectedAssetType}
                onChange={(e) => setSelectedAssetType(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
              >
                <option value="all">All Asset Types</option>
                <option value="Packing">📦 Packing</option>
                <option value="Label">🏷 Labels</option>
                <option value="Material">🧪 Material</option>
                <option value="Creative">🎨 Marketing</option>
                <option value="Video">▶ Videos</option>
                <option value="Document">📄 Documents</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'products' ? (
        filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => setEditingProduct(p)}
                onDelete={(id) => deleteProduct(id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-[#111815] border border-slate-200/80 dark:border-emerald-950/60 rounded-2xl p-8 space-y-3">
            <PackageX className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching products found
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFormulation('all');
              }}
            >
              Clear Search & Filters
            </Button>
          </div>
        )
      ) : (
        filteredAssets.length > 0 ? (
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
            <PackageX className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching asset files found
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedAssetType('all');
              }}
            >
              Clear Search & Filters
            </Button>
          </div>
        )
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
      />
    </div>
  );
};
