import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS, INITIAL_ASSETS, INITIAL_CATEGORIES } from './mockData';

// Helper to convert data URL to File for Supabase storage uploads
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Upload file to Supabase Storage bucket ('sk-agro-assets')
async function uploadToSupabaseStorage(fileBase64, fileName) {
  const supabase = getSupabaseClient();
  if (!supabase || !fileBase64) return null;

  try {
    const file = dataURLtoFile(fileBase64, fileName || `upload_${Date.now()}.jpg`);
    const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    const { data, error } = await supabase.storage
      .from('sk-agro-assets')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('[Supabase Storage Error]:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('sk-agro-assets')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[Supabase Storage Upload Failure]:', err);
    return null;
  }
}

// ==============================================================================
// PRODUCTS API SERVICE (SUPABASE POSTGRES)
// ==============================================================================
export const productsApi = {
  async getProducts() {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Supabase Products Fetch Error]:', err);
      throw err;
    }
  },

  async createProduct(productData) {
    const supabase = getSupabaseClient();
    let mainImageUrl = productData.main_image_url || '';

    // If local base64 file provided, upload directly to Supabase Storage
    if (productData.file_base64 && supabase) {
      const uploadedUrl = await uploadToSupabaseStorage(productData.file_base64, productData.file_name);
      if (uploadedUrl) mainImageUrl = uploadedUrl;
    }

    const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    const newProdPayload = {
      name: productData.name,
      // product_code is removed as it's not in the database schema
      category_id: isValidUUID(productData.category_id) ? productData.category_id : null,
      category_name: productData.category_name || 'General',
      description: productData.description || '',
      main_image_url: mainImageUrl,
      status: 'active'
    };

    if (supabase) {
      const { data, error } = await supabase.from('products').insert([newProdPayload]).select();
      if (error) {
        console.error('[Supabase Create Product Error]:', error);
        throw error;
      }
      if (data && data.length > 0) return data[0];
      throw new Error('No data returned from product creation');
    }

    // Fallback for unconfigured
    return {
      ...newProdPayload,
      id: `prod-${Date.now()}`,
      asset_count: 0,
    };
  },

  async updateProduct(id, productData) {
    const supabase = getSupabaseClient();
    let mainImageUrl = productData.main_image_url || '';

    if (productData.file_base64 && supabase) {
      const uploadedUrl = await uploadToSupabaseStorage(productData.file_base64, productData.file_name);
      if (uploadedUrl) mainImageUrl = uploadedUrl;
    }

    const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    const updatePayload = {
      name: productData.name,
      category_id: isValidUUID(productData.category_id) ? productData.category_id : null,
      category_name: productData.category_name || 'General',
      description: productData.description || '',
      ...(mainImageUrl ? { main_image_url: mainImageUrl } : {}),
      updated_at: new Date().toISOString()
    };

    if (supabase && isValidUUID(id)) {
      const { data, error } = await supabase.from('products').update(updatePayload).eq('id', id).select();
      if (error) {
        console.error('[Supabase Update Product Error]:', error);
        throw error;
      }
      if (data && data.length > 0) return { ...data[0], id };
      throw new Error('No data returned from product update');
    }

    // Fallback for unconfigured
    return { id, ...updatePayload };
  },

  async deleteProduct(id) {
    const supabase = getSupabaseClient();
    const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    
    if (supabase && isValidUUID(id)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('[Supabase Delete Product Error]:', error);
        throw error;
      }
    }
    return { id };
  },
};

// ==============================================================================
// ASSETS API SERVICE (SUPABASE POSTGRES + STORAGE)
// ==============================================================================
export const assetsApi = {
  async getAssets(productId = null) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      let query = supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (productId) query = query.eq('product_id', productId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Supabase Assets Fetch Error]:', err);
      throw err;
    }
  },

  async uploadAsset(assetData) {
    const supabase = getSupabaseClient();
    let fileUrl = assetData.file_url || '';

    // Upload base64 asset to Supabase Storage if provided
    if (assetData.file_base64 && supabase) {
      const uploadedUrl = await uploadToSupabaseStorage(assetData.file_base64, assetData.file_name);
      if (uploadedUrl) fileUrl = uploadedUrl;
    }

    const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    const assetPayload = {
      product_id: isValidUUID(assetData.product_id) ? assetData.product_id : null,
      product_name: assetData.product_name || 'General Product',
      asset_type: assetData.asset_type || 'Packing',
      name: assetData.name,
      file_name: assetData.file_name || assetData.name,
      file_url: fileUrl,
      preview_url: fileUrl,
      file_type: assetData.file_type || 'image/jpeg',
      file_size: assetData.file_size || '3.5 MB',
      description: assetData.description || ''
    };

    if (supabase) {
      const { data, error } = await supabase.from('assets').insert([assetPayload]).select();
      if (error) {
        console.error('[Supabase Asset Upload Error]:', error);
        throw error;
      }
      if (data && data.length > 0) {
        return {
          ...data[0],
          product_id: data[0].product_id || assetData.product_id || null,
        };
      }
      throw new Error('No data returned from asset upload');
    }

    // Fallback for unconfigured
    return {
      ...assetPayload,
      product_id: assetData.product_id || null,
      id: `asset-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  },

  async deleteAsset(id) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not configured.');
    
    const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    if (!isValidUUID(id)) {
      throw new Error(`Invalid asset ID format: ${id}. Expected UUID.`);
    }

    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error('[Supabase Delete Asset Error]:', error);
      throw error;
    }
    
    return { id };
  },
};

// ==============================================================================
// CATEGORIES API SERVICE
// ==============================================================================
export const categoriesApi = {
  async getCategories() {
    const supabase = getSupabaseClient();
    if (!supabase) return INITIAL_CATEGORIES;

    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) return INITIAL_CATEGORIES;
      return data;
    } catch (err) {
      return INITIAL_CATEGORIES;
    }
  },
};

// ==============================================================================
// FAVORITES API SERVICE
// ==============================================================================
export const userActivityApi = {
  async toggleFavorite(userEmail, productId = null, assetId = null) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      if (productId) {
        const { data } = await supabase.from('favorites').select('*').eq('product_id', productId);
        if (data && data.length > 0) {
          await supabase.from('favorites').delete().eq('product_id', productId);
        } else {
          await supabase.from('favorites').insert([{ user_email: userEmail, product_id: productId }]);
        }
      } else if (assetId) {
        const { data } = await supabase.from('favorites').select('*').eq('asset_id', assetId);
        if (data && data.length > 0) {
          await supabase.from('favorites').delete().eq('asset_id', assetId);
        } else {
          await supabase.from('favorites').insert([{ user_email: userEmail, asset_id: assetId }]);
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },
};
