import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ModuleProvider } from './context/ModuleContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

async function loadConfig() {
  try {
    const res = await fetch('/api/config', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('No se pudo cargar configuración');
    const cfg = await res.json();
    if (!cfg?.data?.supabase_url || !cfg?.data?.supabase_anon_key) throw new Error('Config incompleta');
    window.__APP_CONFIG__ = {
      version: cfg.data.app_version || '3.0.0',
      environment: 'production',
      apiUrl: '/api',
      supabaseUrl: cfg.data.supabase_url,
      supabaseKey: cfg.data.supabase_anon_key,
      paypalClientId: cfg.data.paypal_client_id || '',
      appUrl: cfg.data.app_url || location.origin
    };
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
                <BrowserRouter>
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
                </BrowserRouter>
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

