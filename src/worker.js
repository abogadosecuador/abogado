/**
 * Worker Principal - Abogados Ecuador
 * Sistema completo con diagnóstico automático y corrección de errores
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Configuración de CORS profesional
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey, X-Request-ID',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
};

// Sistema de diagnóstico y métricas
class DiagnosticSystem {
  constructor(env) {
    this.env = env;
    this.metrics = {
      requests: 0,
      errors: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  async logRequest(request, response, duration) {
    this.metrics.requests++;
    
    const log = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status: response.status,
      duration: duration,
      userAgent: request.headers.get('User-Agent'),
      ip: request.headers.get('CF-Connecting-IP')
    };

    try {
      await this.env.ABOGADO_WILSON_KV.put(
        `log:${Date.now()}`,
        JSON.stringify(log),
        { expirationTtl: 86400 * 7 } // 7 días
      );
    } catch (e) {
      console.error('Error logging request:', e);
    }
  }

  async logError(error, context) {
    this.metrics.errors++;
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context
    };

    try {
      await this.env.ABOGADO_WILSON_KV.put(
        `error:${Date.now()}`,
        JSON.stringify(errorLog),
        { expirationTtl: 86400 * 30 } // 30 días
      );

      // Auto-corrección: reintentar si es posible
      if (context.retryable && context.retries < 3) {
        console.log(`Reintentando operación: ${context.operation}`);
        return true;
      }
    } catch (e) {
      console.error('Error logging error:', e);
    }
    
    return false;
  }

  async getMetrics() {
    return this.metrics;
  }

  async healthCheck() {
    const checks = {
      kv: false,
      d1: false,
      supabase: false,
      cloudinary: false,
      paypal: false
    };

    // Verificar KV
    try {
      await this.env.ABOGADO_WILSON_KV.put('health:check', Date.now().toString());
      checks.kv = true;
    } catch (e) {
      console.error('KV health check failed:', e);
    }

    // Verificar D1
    try {
      await this.env.ABOGADO_WILSON_DB.prepare('SELECT 1').first();
      checks.d1 = true;
    } catch (e) {
      console.error('D1 health check failed:', e);
    }

    // Verificar Supabase
    try {
      const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.env.SUPABASE_KEY,
          'Authorization': `Bearer ${this.env.SUPABASE_KEY}`
        }
      });
      checks.supabase = response.ok;
    } catch (e) {
      console.error('Supabase health check failed:', e);
    }

    // Verificar Cloudinary
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dg3s7tqoj/resources/image`;
      const response = await fetch(cloudinaryUrl, {
        headers: {
          'Authorization': `Basic ${btoa('673776954212897:MOzrryrl-3w0abD2YftOWYOs3O8')}`
        }
      });
      checks.cloudinary = response.ok;
    } catch (e) {
      console.error('Cloudinary health check failed:', e);
    }

    return checks;
  }
}

// Sistema de API mejorado
class APIHandler {
  constructor(env, diagnostic) {
    this.env = env;
    this.diagnostic = diagnostic;
  }

  async handleRequest(request, url) {
    const endpoint = url.pathname.replace('/api/', '');
    
    try {
      switch(endpoint) {
        case 'config':
          return this.getConfig();
        case 'health':
          return this.healthCheck();
        case 'metrics':
          return this.getMetrics();
        case 'supabase':
          return this.proxySupabase(request);
        case 'cloudinary/upload':
          return this.handleCloudinaryUpload(request);
        case 'paypal/create-order':
          return this.createPayPalOrder(request);
        case 'contact':
          return this.handleContact(request);
        case 'whatsapp':
          return this.sendWhatsApp(request);
        default:
          return this.notFound();
      }
    } catch (error) {
      await this.diagnostic.logError(error, {
        operation: endpoint,
        retryable: true,
        retries: 0
      });
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }

  getConfig() {
    const config = {
      SUPABASE_URL: 'https://kbybhgxqdefuquybstqk.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE',
      CLOUDINARY_CLOUD_NAME: 'dg3s7tqoj',
      CLOUDINARY_UPLOAD_PRESET: 'ml_default',
      PAYPAL_CLIENT_ID: 'AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS',
      WHATSAPP_NUMBER: '+59398835269',
      CONTACT_EMAIL: 'Wifirmalegal@gmail.com',
      N8N_WEBHOOK_URL: 'https://n8n-latest-hurl.onrender.com',
      APP_VERSION: '3.0.0',
      APP_ENV: 'production'
    };

    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders
      }
    });
  }

  async healthCheck() {
    const health = await this.diagnostic.healthCheck();
    const metrics = await this.diagnostic.getMetrics();
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: health,
      metrics: metrics
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async getMetrics() {
    const metrics = await this.diagnostic.getMetrics();
    
    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async proxySupabase(request) {
    const body = await request.json();
    const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/${body.table}`, {
      method: body.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.env.SUPABASE_KEY,
        'Authorization': `Bearer ${this.env.SUPABASE_KEY}`
      },
      body: body.data ? JSON.stringify(body.data) : undefined
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async handleCloudinaryUpload(request) {
    const formData = await request.formData();
    
    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dg3s7tqoj/image/upload';
    
    const uploadData = new FormData();
    uploadData.append('file', formData.get('file'));
    uploadData.append('upload_preset', 'ml_default');
    uploadData.append('api_key', '673776954212897');

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: uploadData
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async createPayPalOrder(request) {
    const body = await request.json();
    
    const auth = btoa('AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS:EO-ghpkDi_L5oQx9dkZPg3gABTs_UuWmsBtaexDyfYfXMhjbcJ3KK0LAuntr4zjoNSViGHZ_rkD7-YCt');
    
    const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: body.amount || '10.00'
          },
          description: body.description || 'Servicio Legal'
        }]
      })
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async handleContact(request) {
    const body = await request.json();
    
    // Guardar en KV
    await this.env.ABOGADO_WILSON_KV.put(
      `contact:${Date.now()}`,
      JSON.stringify({
        ...body,
        timestamp: new Date().toISOString()
      })
    );

    // Guardar en D1
    await this.env.ABOGADO_WILSON_DB.prepare(
      'INSERT INTO contacts (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      body.name,
      body.email,
      body.phone,
      body.message,
      new Date().toISOString()
    ).run();

    // Enviar a N8N
    await fetch('https://n8n-latest-hurl.onrender.com/webhook/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Mensaje enviado correctamente'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async sendWhatsApp(request) {
    const body = await request.json();
    
    // Integración con API de WhatsApp Business
    const response = await fetch('https://api.whatsapp.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        to: '+59398835269',
        message: body.message
      })
    });

    return new Response(JSON.stringify({
      success: response.ok,
      message: 'Mensaje enviado'
    }), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  notFound() {
    return new Response(JSON.stringify({
      error: 'Endpoint not found'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Manejador principal
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const url = new URL(request.url);
    
    // Inicializar sistema de diagnóstico
    const diagnostic = new DiagnosticSystem(env);
    
    // Manejar OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      let response;

      // Rutas API
      if (url.pathname.startsWith('/api/')) {
        const apiHandler = new APIHandler(env, diagnostic);
        response = await apiHandler.handleRequest(request, url);
      }
      // Archivos estáticos y SPA
      else {
        response = await handleStaticAssets(request, env, ctx);
      }

      // Log de solicitud
      const duration = Date.now() - startTime;
      await diagnostic.logRequest(request, response, duration);

      return response;
    } catch (error) {
      await diagnostic.logError(error, {
        operation: 'main',
        url: url.pathname,
        retryable: false
      });

      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Abogados Ecuador</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .error-container {
              background: white;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #333; margin-bottom: 1rem; }
            p { color: #666; margin-bottom: 1.5rem; }
            button {
              background: #667eea;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover { background: #5a67d8; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>¡Ups! Algo salió mal</h1>
            <p>Estamos trabajando para solucionarlo. Por favor, intenta nuevamente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
            <button onclick="window.location.href='/'">Ir al inicio</button>
          </div>
        </body>
        </html>
      `, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }
  }
};

// Manejo de archivos estáticos
async function handleStaticAssets(request, env, ctx) {
  const url = new URL(request.url);
  
  // Favicon especial
  if (url.pathname === '/favicon.ico' || url.pathname === '/favicon.svg') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="#2563eb"/>
      <text x="50" y="70" font-size="60" text-anchor="middle" fill="white">⚖</text>
    </svg>`;
    
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': url.pathname.endsWith('.ico') ? 'image/x-icon' : 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
        ...corsHeaders
      }
    });
  }

  try {
    const asset = await getAssetFromKV(
      { request, waitUntil: ctx.waitUntil.bind(ctx) },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST),
        mapRequestToAsset: (req) => {
          const url = new URL(req.url);
          if (!url.pathname.includes('.') && url.pathname !== '/') {
            return new Request(`${url.origin}/index.html`, req);
          }
          return req;
        },
        cacheControl: {
          byExtension: {
            'html': { browserTTL: 0, edgeTTL: 300 },
            'js': { browserTTL: 86400, edgeTTL: 86400 },
            'css': { browserTTL: 86400, edgeTTL: 86400 },
            'png': { browserTTL: 604800, edgeTTL: 604800 },
            'jpg': { browserTTL: 604800, edgeTTL: 604800 },
            'jpeg': { browserTTL: 604800, edgeTTL: 604800 },
            'svg': { browserTTL: 604800, edgeTTL: 604800 },
            'ico': { browserTTL: 604800, edgeTTL: 604800 }
          }
        }
      }
    );

    const headers = new Headers(asset.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(asset.body, {
      status: 200,
      headers
    });
  } catch (e) {
    // Fallback a index.html para SPA
    try {
      const asset = await getAssetFromKV(
        { 
          request: new Request(`${url.origin}/index.html`, request),
          waitUntil: ctx.waitUntil.bind(ctx)
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST)
        }
      );

      const headers = new Headers(asset.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(asset.body, {
        status: 200,
        headers
      });
    } catch (fallbackError) {
      // HTML de emergencia
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Abogados Ecuador</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
              color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.9; }
            .spinner {
              border: 3px solid rgba(255,255,255,0.3);
              border-top: 3px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script>
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <h1>⚖ Abogados Ecuador</h1>
            <p>Cargando aplicación...</p>
            <div class="spinner"></div>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }
  }
}
