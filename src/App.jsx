import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { CatalogHub } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Favorites } from './pages/Assets';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { AddProductModal, AddAssetModal } from './components/ui/Modals';

const MainApp = () => {
  const { user, setUser } = useApp();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [targetProductIdForAsset, setTargetProductIdForAsset] = useState('');

  const handleOpenAddAsset = (productId = '') => {
    setTargetProductIdForAsset(productId);
    setIsAddAssetOpen(true);
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <AppLayout onOpenAddProduct={() => setIsAddProductOpen(true)}>
      <Routes>
        <Route
          path="/"
          element={
            <CatalogHub
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenAddAsset={handleOpenAddAsset}
            />
          }
        />
        <Route
          path="/products"
          element={
            <CatalogHub
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenAddAsset={handleOpenAddAsset}
            />
          }
        />
        <Route
          path="/products/:id"
          element={<ProductDetails onOpenAddAsset={handleOpenAddAsset} />}
        />
        <Route
          path="/assets"
          element={
            <CatalogHub
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenAddAsset={handleOpenAddAsset}
            />
          }
        />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Form Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        defaultProductId={targetProductIdForAsset}
      />
    </AppLayout>
  );
};

export const App = () => {
  return (
    <HashRouter>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </HashRouter>
  );
};

export default App;
