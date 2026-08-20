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

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [favorites, setFavorites] = useState([]);
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
        if (cats) setCategories(cats);
        if (prods) setProducts(prods);
        if (asts) setAssets(asts);
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
