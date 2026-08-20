import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Upload, Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { toTitleCase } from '../../utils/textFormat';

export const AddProductModal = ({ isOpen, onClose }) => {
  const { categories, addProduct, addAsset } = useApp();
  const [imageSource, setImageSource] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: categories[0]?.id || '',
    description: '',
    main_image_url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=800',
  });
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');

  // Additional Assets attached during creation
  const [extraAssets, setExtraAssets] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
        setFormData((prev) => ({ ...prev, main_image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExtraAssetFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        setExtraAssets((prev) => [
          ...prev,
          {
            id: `extra-${Date.now()}-${Math.random()}`,
            name: toTitleCase(rawName),
            asset_type: file.type?.includes('pdf') ? 'Document' : 'Packing',
            packing_size: '500ml',
            file_name: file.name,
            file_type: file.type || 'image/jpeg',
            file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            file_base64: reader.result,
            file_url: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateExtraAsset = (id, field, value) => {
    const formattedValue = field === 'name' ? toTitleCase(value) : value;
    setExtraAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: formattedValue } : a))
    );
  };

  const handleRemoveExtraAsset = (id) => {
    setExtraAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const catObj = categories.find((c) => c.id === formData.category_id);
      const autoProductCode = `SK-PROD-${Date.now().toString().slice(-4)}`;

      // 1. Create Product with Title Case
      const createdProduct = await addProduct({
        ...formData,
        name: toTitleCase(formData.name),
        product_code: autoProductCode,
        category_name: catObj?.name || 'General',
        file_base64: fileBase64,
        file_name: fileName,
      });

      // 2. Attach Extra Assets with Title Case
      if (extraAssets.length > 0 && createdProduct?.id) {
        for (const asset of extraAssets) {
          await addAsset({
            product_id: createdProduct.id,
            product_name: createdProduct.name,
            name: toTitleCase(asset.name),
            asset_type: asset.asset_type,
            packing_size: asset.packing_size,
            file_name: asset.file_name,
            file_type: asset.file_type,
            file_size: asset.file_size,
            file_base64: asset.file_base64,
            file_url: asset.file_url,
            preview_url: asset.file_url,
          });
        }
      }

      // Reset local form state
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        description: '',
        main_image_url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=800',
      });
      setFileName('');
      setFileBase64('');
      setExtraAssets([]);

      onClose();
    } catch (err) {
      console.error('Error creating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Product"
      subtitle="Add a new product to the catalog and attach initial media files below."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Imaze Clear"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: toTitleCase(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all capitalize"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#16201C]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Main Cover Photo */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-[#16201C]/60 border border-slate-200 dark:border-emerald-950/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Product Main Cover Photo
            </label>
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-[#0E1512] p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-semibold transition-all ${
                  imageSource === 'upload'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upload Device Photo
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-semibold transition-all ${
                  imageSource === 'url'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                URL / Drive Link
              </button>
            </div>
          </div>

          {imageSource === 'upload' ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-emerald-950 rounded-xl p-4 sm:p-5 text-center hover:border-emerald-500 transition-colors cursor-pointer relative bg-white dark:bg-[#111815]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {fileName ? `Selected: ${fileName}` : 'Click or Drag cover photo from device'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">Uploads automatically</span>
              </div>
            </div>
          ) : (
            <input
              type="url"
              placeholder="https://... image link"
              value={formData.main_image_url}
              onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          )}
        </div>

        {/* Dynamic Extra Assets Section Right Below */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-[#16201C]/60 border border-slate-200 dark:border-emerald-950/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Attach Product Assets & Documents
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Upload packing photos, labels, PDFs, or videos. Select a category for each asset.
              </p>
            </div>

            <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all shrink-0 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add Asset File
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,video/*"
                onChange={handleAddExtraAssetFile}
                className="hidden"
              />
            </label>
          </div>

          {/* List of Attached Extra Assets */}
          {extraAssets.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {extraAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-emerald-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
                    {asset.file_type?.includes('pdf') ? (
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(e) => handleUpdateExtraAsset(asset.id, 'name', e.target.value)}
                      placeholder="Asset Title"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-white text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 capitalize"
                    />
                  </div>

                  {/* Category Dropdown for each asset */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <select
                      value={asset.asset_type}
                      onChange={(e) => handleUpdateExtraAsset(asset.id, 'asset_type', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="Packing" className="bg-white dark:bg-[#16201C]">📦 Packing Photo</option>
                      <option value="Label" className="bg-white dark:bg-[#16201C]">🏷 Label File</option>
                      <option value="Material" className="bg-white dark:bg-[#16201C]">🧪 Material Photo</option>
                      <option value="Creative" className="bg-white dark:bg-[#16201C]">🎨 Marketing Creative</option>
                      <option value="Video" className="bg-white dark:bg-[#16201C]">▶ Video</option>
                      <option value="Document" className="bg-white dark:bg-[#16201C]">📄 Document / PDF</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveExtraAsset(asset.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Remove Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-white dark:bg-[#111815] border border-dashed border-slate-200 dark:border-emerald-950/80 text-xs text-slate-400">
              No extra assets attached yet. Click "+ Add Asset File" above to attach labels, PDFs, or packing photos directly.
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
            Product Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: toTitleCase(e.target.value) })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all capitalize"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-emerald-950/60">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Product...' : 'Save Product & Assets'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AddAssetModal = ({ isOpen, onClose, defaultProductId = '' }) => {
  const { products, addAsset } = useApp();
  const [extraAssets, setExtraAssets] = useState([]);
  const [targetProductId, setTargetProductId] = useState(defaultProductId || products[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const initialId = defaultProductId || (products.length > 0 ? products[0].id : '');
      setTargetProductId(initialId);
      setExtraAssets([]);
    }
  }, [isOpen, defaultProductId, products]);

  const handleAddExtraAssetFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        setExtraAssets((prev) => [
          ...prev,
          {
            id: `extra-${Date.now()}-${Math.random()}`,
            name: toTitleCase(rawName),
            asset_type: file.type?.includes('pdf') ? 'Document' : 'Packing',
            packing_size: '500ml',
            file_name: file.name,
            file_type: file.type || 'image/jpeg',
            file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            file_base64: reader.result,
            file_url: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateExtraAsset = (id, field, value) => {
    const formattedValue = field === 'name' ? toTitleCase(value) : value;
    setExtraAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: formattedValue } : a))
    );
  };

  const handleRemoveExtraAsset = (id) => {
    setExtraAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetProductId || extraAssets.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const prodObj = products.find((p) => String(p.id) === String(targetProductId));

      for (const asset of extraAssets) {
        await addAsset({
          product_id: targetProductId,
          product_name: prodObj?.name || 'General Product',
          name: toTitleCase(asset.name),
          asset_type: asset.asset_type,
          packing_size: asset.packing_size,
          file_name: asset.file_name,
          file_type: asset.file_type,
          file_size: asset.file_size,
          file_base64: asset.file_base64,
          file_url: asset.file_url,
          preview_url: asset.file_url,
        });
      }

      setExtraAssets([]);
      onClose();
    } catch (err) {
      console.error('Error saving assets:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload & Link Product Assets"
      subtitle="Attach high-res packing photos, label PDFs, or technical documents to an existing product."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
            Target Product *
          </label>
          <select
            value={targetProductId}
            onChange={(e) => setTargetProductId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-[#16201C]">
                {p.name} ({p.product_code})
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Extra Assets Attachment Section - Identical to Add Product */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#16201C]/60 border border-slate-200 dark:border-emerald-950/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Select & Attach Asset Files
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Upload packing photos, label PDFs, or videos. Select an asset category for each file.
              </p>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all shrink-0">
              <Plus className="w-4 h-4" /> Add Asset File
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,video/*"
                onChange={handleAddExtraAssetFile}
                className="hidden"
              />
            </label>
          </div>

          {/* List of Attached Extra Assets */}
          {extraAssets.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {extraAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-emerald-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
                    {asset.file_type?.includes('pdf') ? (
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(e) => handleUpdateExtraAsset(asset.id, 'name', e.target.value)}
                      placeholder="Asset Title"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-white text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 capitalize"
                    />
                  </div>

                  {/* Category Dropdown for each asset */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <select
                      value={asset.asset_type}
                      onChange={(e) => handleUpdateExtraAsset(asset.id, 'asset_type', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="Packing" className="bg-white dark:bg-[#16201C]">📦 Packing Photo</option>
                      <option value="Label" className="bg-white dark:bg-[#16201C]">🏷 Label File</option>
                      <option value="Material" className="bg-white dark:bg-[#16201C]">🧪 Material Photo</option>
                      <option value="Creative" className="bg-white dark:bg-[#16201C]">🎨 Marketing Creative</option>
                      <option value="Video" className="bg-white dark:bg-[#16201C]">▶ Video</option>
                      <option value="Document" className="bg-white dark:bg-[#16201C]">📄 Document / PDF</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveExtraAsset(asset.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Remove Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-white dark:bg-[#111815] border border-dashed border-slate-200 dark:border-emerald-950/80 text-xs text-slate-400 space-y-2">
              <Upload className="w-6 h-6 mx-auto text-emerald-600 dark:text-emerald-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No files selected yet
              </p>
              <p className="text-[11px] text-slate-400">
                Click "+ Add Asset File" above to upload packing photos, label PDFs, or technical files for this product.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-emerald-950/60">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={extraAssets.length === 0 || isSubmitting}>
            {isSubmitting ? 'Saving Assets...' : `Save & Attach Assets (${extraAssets.length})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const EditProductModal = ({ isOpen, onClose, product }) => {
  const { categories, updateProduct } = useApp();
  const [imageSource, setImageSource] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || categories[0]?.id || '',
    description: product?.description || '',
    main_image_url: product?.main_image_url || '',
  });

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id || categories[0]?.id || '',
        description: product.description || '',
        main_image_url: product.main_image_url || '',
      });
      setFileName('');
      setFileBase64('');
    }
  }, [product, categories]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
        setFormData((prev) => ({ ...prev, main_image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product?.id || !formData.name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const catObj = categories.find((c) => c.id === formData.category_id);
      await updateProduct(product.id, {
        ...formData,
        name: toTitleCase(formData.name),
        category_name: catObj?.name || product.category_name,
        file_base64: fileBase64,
        file_name: fileName,
      });

      onClose();
    } catch (err) {
      console.error('Error updating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Product Information"
      subtitle="Update product details and cover image in the database."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: toTitleCase(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all capitalize"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#16201C]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Main Cover Photo */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#16201C]/60 border border-slate-200 dark:border-emerald-950/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Product Cover Photo
            </label>
            <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-[#0E1512] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                  imageSource === 'upload'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upload New Image
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                  imageSource === 'url'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                URL / Drive Link
              </button>
            </div>
          </div>

          {imageSource === 'upload' ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-emerald-950 rounded-xl p-5 text-center hover:border-emerald-500 transition-colors cursor-pointer relative bg-white dark:bg-[#111815]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {fileName ? `Selected: ${fileName}` : 'Click or Drag to update cover photo'}
                </span>
              </div>
            </div>
          ) : (
            <input
              type="url"
              placeholder="https://... image link"
              value={formData.main_image_url}
              onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-emerald-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
            Product Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: toTitleCase(e.target.value) })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#16201C] border border-slate-200 dark:border-emerald-950/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all capitalize"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-emerald-950/60">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
