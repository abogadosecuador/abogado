import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ModuleProvider } from './context/ModuleContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import './index.css';

async function loadConfig() {
  try {
    // Configuración directa sin API
    window.__APP_CONFIG__ = {
      supabaseUrl: 'https://kbybhgxqdefuquybstqk.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE'
    };
    return;
  } catch (e) {
    console.error('Error cargando config:', e);
    // fallback mínimo para no romper la app
    window.__APP_CONFIG__ = window.__APP_CONFIG__ || { apiUrl: '/api' };
  }
}

async function initializeApp() {
  try {
    await loadConfig();
    console.log('🚀 Iniciando aplicación Abogado Wilson...');
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <CartProvider>
            <ModuleProvider>
              <ThemeProvider>
                <PayPalScriptProvider options={{ "client-id": window.__APP_CONFIG__?.paypalClientId || "" }}>
                  <HelmetProvider>
                    <HashRouter>
                      <App />
                      <Toaster 
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: '#363636',
                            color: '#fff',
                          },
                        }}
                      />
                    </HashRouter>
                  </HelmetProvider>
                </PayPalScriptProvider>
              </ThemeProvider>
            </ModuleProvider>
          </CartProvider>
        </AuthProvider>
      </React.StrictMode>
    );
    
    console.log('✅ Aplicación cargada correctamente');
    
  } catch (error) {
    console.error('❌ Error al cargar la aplicación:', error);
    
    // Mostrar mensaje de error en la página
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: 'Inter', sans-serif;
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Error de Carga</h1>
          <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9;">
            Ha ocurrido un error al cargar la aplicación. Por favor, recarga la página.
          </p>
          <button 
            onclick="window.location.reload()"
            style="
              background: white;
              color: #667eea;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            "
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Recargar Página
          </button>
        </div>
      `;
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { initializeApp(); });
} else {
  initializeApp();
}

