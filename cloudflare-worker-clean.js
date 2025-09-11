// Nota: El entorno de Cloudflare Workers no soporta Prisma Client (dependencia de Node.js)
// Se reemplaza por endpoints ligeros compatibles con Workers y uso de KV/D1 vía bindings.

/**
 * Cloudflare Worker limpio y compatible para Abogado Wilson
 * Este archivo resuelve los problemas de sintaxis del worker original
 */

// Función para obtener variables de entorno o valores por defecto
function getEnvVariable(env, name, defaultValue) {
  return env && env[name] !== undefined ? env[name] : defaultValue;
}

// Inicialización tardía de variables globales
let ENV = null;

// Función para inicializar variables globales
function initEnv(env) {
  return {
    SUPABASE_URL: getEnvVariable(env, 'SUPABASE_URL', ''),
    SUPABASE_KEY: getEnvVariable(env, 'SUPABASE_KEY', ''),
    ENVIRONMENT: getEnvVariable(env, 'ENVIRONMENT', 'development'), // Default to development for local
    API_ENABLED: getEnvVariable(env, 'API_ENABLED', 'true') === 'true',
    CORS_ORIGIN: getEnvVariable(env, 'CORS_ORIGIN', '*'),
    WHATSAPP_NUMBER: getEnvVariable(env, 'WHATSAPP_NUMBER', '+59398835269'),
    N8N_WEBHOOK_URL: getEnvVariable(env, 'N8N_WEBHOOK_URL', 'https://n8nom.onrender.com/webhook/1cfd2baa-f5ec-4bc4-a99d-dfb36793eabd'),
    CONTACT_EMAIL: getEnvVariable(env, 'CONTACT_EMAIL', 'Wifirmalegal@gmail.com'),
  };
}

// Configuración estándar de CORS
const standardHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache', // No cache for API
  'X-Content-Type-Options': 'nosniff'
};

// --- API ROUTER ---
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      // Endpoint de salud
      if (path === '/api/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ ok: true, status: 'healthy', time: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json', ...standardHeaders }
        });
      }

      // Endpoint de diagnóstico (no expone secretos)
      if (path === '/api/diag' && request.method === 'GET') {
        const hasKV = typeof env.ABOGADO_WILSON_KV !== 'undefined';
        const diag = {
          environment: ENV?.ENVIRONMENT || 'production',
          hasKV,
          hasSupabaseUrl: Boolean(ENV?.SUPABASE_URL),
          routes: ['GET /api/health', 'GET /api/diag', 'POST /api/progress'],
          time: new Date().toISOString(),
        };
        return new Response(JSON.stringify(diag), {
          headers: { 'Content-Type': 'application/json', ...standardHeaders }
        });
      }

      // Endpoint para registrar progreso de despliegue/carga (diagnóstico)
      if (path === '/api/progress' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const step = body?.step || 'unknown';
        const note = body?.note || '';
        const key = `deploy:progress:${Date.now()}`;
        try {
          if (env.ABOGADO_WILSON_KV) {
            await env.ABOGADO_WILSON_KV.put(key, JSON.stringify({ step, note, at: new Date().toISOString() }), { expirationTtl: 86400 });
          }
        } catch (e) {
          // Continuar aunque KV falle
          console.error('KV put error', e);
        }
        return new Response(JSON.stringify({ stored: true, key }), {
          headers: { 'Content-Type': 'application/json', ...standardHeaders }
        });
      }

      // Fallback para rutas API no existentes
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...standardHeaders }
      });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: error?.message || String(error) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...standardHeaders }
      });
    }
}


/**
 * Renderiza la página de mantenimiento en caso de problemas
 */
function renderMaintenancePage(env) {
  // Asegurar que ENV esté inicializado
  const config = ENV || initEnv(env);
  
  const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estamos en mantenimiento - Abogado Wilson</title>
    <style>
      body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
      .header { color: #2563eb; }
      .message { background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 1rem; }
      .contact { margin-top: 2rem; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="header">Abogado Wilson</h1>
      <div class="message">
        <p>Estamos realizando mejoras en nuestro sitio. Por favor, inténtelo de nuevo en unos minutos.</p>
      </div>
      <div class="contact">
        <p>Para consultas inmediatas:</p>
        <ul>
          <li>Email: ${config.CONTACT_EMAIL}</li>
          <li>WhatsApp: ${config.WHATSAPP_NUMBER}</li>
        </ul>
      </div>
    </div>
  </body>
  </html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8'
    }
  });
}

/**
 * Maneja las solicitudes a recursos estáticos
 */
async function handleStaticRequest(request, url) {
  // Verificar si es una solicitud de favicon
  if (url.pathname === '/favicon.ico') {
    // Servir el favicon desde la carpeta /dist/favicon.ico
    try {
      return fetch(request);
    } catch (error) {
      console.error('Error al servir favicon:', error);
      // Fallback - responder con una imagen vacía
      return new Response(null, {
        status: 204
      });
    }
  }

  // Intentar servir el archivo estático
  try {
    return fetch(request);
  } catch (error) {
    console.error('Error al servir archivo estático:', error);
    return new Response('Recurso no encontrado', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Función principal del worker para manejar solicitudes
 */
export default {
  async fetch(request, env, ctx) {
    // Define CORS headers in one place
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // O un origen específico para más seguridad
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
      'Access-Control-Max-Age': '86400', // Cache preflight requests for a day
    };

    // Handle CORS preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    let response;
    try {
      // Initialize environment variables
      ENV = initEnv(env);

      const url = new URL(request.url);

      // Route API requests
      if (url.pathname.startsWith('/api/')) {
        response = await handleApiRequest(request, env);
      } 
      // Handle static assets using Cloudflare Assets binding
      else {
        if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          response = await env.ASSETS.fetch(request);
        } else {
          // Fallback simple
          response = new Response('Static assets not configured', { status: 500, headers: { 'Content-Type': 'text/plain' } });
        }
      }
    } catch (error) {
      console.error('Critical Worker Error:', error);
      // Create a generic error response if something unexpected happens
      response = new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Clone the response to make it mutable
    const mutableResponse = new Response(response.body, response);

    // Apply CORS headers to every single response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      mutableResponse.headers.set(key, value);
    });

    return mutableResponse;
  },
};
