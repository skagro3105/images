import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsApi, assetsApi, categoriesApi, userActivityApi } from '../services/api';
import { INITIAL_PRODUCTS, INITIAL_ASSETS, INITIAL_CATEGORIES } from '../services/mockData';
import { isSupabaseConfigured } from '../lib/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('sk_theme') || 'dark');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sk_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('sk_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sk_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('sk_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('sk_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeLightboxAsset, setActiveLightboxAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync dark mode class reliably with root html element & body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('sk_theme', theme);
  }, [theme]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('sk_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sk_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sk_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('sk_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch live Supabase data directly from Cloud Database
  const loadData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const [cats, prods, asts] = await Promise.all([
          categoriesApi.getCategories(),
          productsApi.getProducts(),
          assetsApi.getAssets()
        ]);
        if (cats && cats.length > 0) setCategories(cats);
        if (prods && prods.length > 0) setProducts(prods);
        if (asts && asts.length > 0) setAssets(asts);
      }
    } catch (e) {
      console.error('Supabase fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const toggleTheme = (newTheme) => {
    setTheme((prev) => {
      const next = newTheme || (prev === 'light' ? 'dark' : 'light');
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      localStorage.setItem('sk_theme', next);
      return next;
    });
  };

  const toggleFavoriteProduct = async (productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    await userActivityApi.toggleFavorite(user?.email || 'usr-1', productId, null);
  };

  const toggleFavoriteAsset = async (assetId) => {
    setFavorites((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
    await userActivityApi.toggleFavorite(user?.email || 'usr-1', null, assetId);
  };

  const addProduct = async (newProd) => {
    const created = await productsApi.createProduct(newProd);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id, updatedProdData) => {
    const updated = await productsApi.updateProduct(id, updatedProdData);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    return updated;
  };

  const deleteProduct = async (id) => {
    await productsApi.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setAssets((prev) => prev.filter((a) => a.product_id !== id));
  };

  const addAsset = async (newAsset) => {
    const created = await assetsApi.uploadAsset(newAsset);
    setAssets((prev) => [created, ...prev]);
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(newAsset.product_id) ? { ...p, asset_count: (p.asset_count || 0) + 1 } : p))
    );
    return created;
  };

  const deleteAsset = async (id) => {
    const targetAsset = assets.find((a) => String(a.id) === String(id));
    try {
      await assetsApi.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => String(a.id) !== String(id)));
      if (targetAsset?.product_id) {
        setProducts((prev) =>
          prev.map((p) =>
            String(p.id) === String(targetAsset.product_id)
              ? { ...p, asset_count: Math.max(0, (p.asset_count || 1) - 1) }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to delete asset in AppContext:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        setUser,
        categories,
        products,
        assets,
        favorites,
        toggleFavoriteProduct,
        toggleFavoriteAsset,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        activeLightboxAsset,
        setActiveLightboxAsset,
        addProduct,
        updateProduct,
        deleteProduct,
        addAsset,
        deleteAsset,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
