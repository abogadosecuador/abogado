import React, { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/index';

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App min-h-screen bg-white text-gray-900">
            <Suspense fallback={<div>Cargando...</div>}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
