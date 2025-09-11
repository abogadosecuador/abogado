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
// Utilidad: generar un UUID v4 para correlación de peticiones
function uuid4() {
  const r = crypto.getRandomValues(new Uint8Array(16));
  r[6] = (r[6] & 0x0f) | 0x40;
  r[8] = (r[8] & 0x3f) | 0x80;
  const toHex = (n) => n.toString(16).padStart(2, '0');
  const hex = Array.from(r, toHex).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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

// --- LOGGING UTILITIES ---
function log(level, requestId, data) {
  const payload = {
    level,
    requestId,
    ts: new Date().toISOString(),
    ...data,
  };
  const out = JSON.stringify(payload);
  if (level === 'error') console.error(out);
  else if (level === 'warn') console.warn(out);
  else console.log(out);
}

async function persistSystemLog(env, entry) {
  // Persistencia ligera: usar KV y D1 si están disponibles. Sampling 10% para reducir costo
  const sampled = Math.random() < 0.1;
  if (!sampled) return;

  // KV (opcional)
  try {
    if (env.ABOGADO_WILSON_KV) {
      const key = `log:${entry.requestId || uuid4()}:${Date.now()}`;
      await env.ABOGADO_WILSON_KV.put(key, JSON.stringify(entry), { expirationTtl: 7 * 24 * 3600 });
    }
  } catch (e) {
    console.warn(JSON.stringify({ level: 'warn', message: 'KV log persist failed', error: String(e) }));
  }

  // D1 (opcional) usando tabla existente system_logs (nivel, mensaje, contexto)
  try {
    if (env.ABOGADO_WILSON_DB && typeof env.ABOGADO_WILSON_DB.prepare === 'function') {
      const nivel = entry.level || 'info';
      const mensaje = entry.message || 'log';
      const contexto = JSON.stringify(entry);
      await env.ABOGADO_WILSON_DB.prepare(
        `INSERT INTO system_logs (id, nivel, mensaje, contexto, created_at) VALUES (?, ?, ?, ?, datetime('now'))`
      ).bind(uuid4(), nivel, mensaje, contexto).run();
    }
  } catch (e) {
    console.warn(JSON.stringify({ level: 'warn', message: 'D1 log persist failed', error: String(e) }));
  }
}

// --- API ROUTER ---
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const requestId = request.headers.get('x-request-id') || request.headers.get('cf-ray') || uuid4();
  const base = { requestId, route: path, method: request.method, ua: request.headers.get('user-agent') };
  try {
    // Endpoint de salud
    if (path === '/api/health' && request.method === 'GET') {
      log('info', requestId, { message: 'healthcheck', ...base });
      return new Response(JSON.stringify({ ok: true, status: 'healthy', time: new Date().toISOString(), requestId }), {
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
      log('info', requestId, { message: 'diag', ...base, diag });
      return new Response(JSON.stringify({ ...diag, requestId }), {
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
      log('info', requestId, { message: 'progress stored', ...base, key, step });
      return new Response(JSON.stringify({ stored: true, key, requestId }), {
        headers: { 'Content-Type': 'application/json', ...standardHeaders }
      });
    }

    // Fallback para rutas API no existentes
    log('warn', requestId, { message: 'not_found', ...base });
    return new Response(JSON.stringify({ error: 'Not Found', requestId }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...standardHeaders }
    });
  } catch (error) {
    log('error', requestId, { message: 'api_error', ...base, details: error?.message || String(error) });
    // Persistencia diferida: el caller (fetch) hará waitUntil para no bloquear
    throw Object.assign(new Error('API Error'), { original: error, requestId });
  }
}

// Helper para respuestas de error con persistencia
function errorResponse(requestId, status = 500) {
  return new Response(JSON.stringify({ error: 'Internal Server Error', requestId }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', ...standardHeaders }
  });
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
    const requestId = request.headers.get('x-request-id') || request.headers.get('cf-ray') || uuid4();
    try {
      // Initialize environment variables
      ENV = initEnv(env);

      const url = new URL(request.url);

      // Route API requests
      if (url.pathname.startsWith('/api/')) {
        try {
          response = await handleApiRequest(request, env);
        } catch (apiErr) {
          // Persistencia asincrónica del error
          ctx.waitUntil(persistSystemLog(env, {
            level: 'error',
            message: 'api_unhandled',
            requestId,
            route: url.pathname,
            method: request.method,
            error: String(apiErr?.original || apiErr)
          }));
          return errorResponse(requestId, 500);
        }
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
      log('error', requestId, { message: 'critical_worker_error', error: String(error) });
      ctx.waitUntil(persistSystemLog(env, {
        level: 'error',
        message: 'critical_worker_error',
        requestId,
        error: String(error)
      }));
      // Create a generic error response if something unexpected happens
      response = new Response(JSON.stringify({ error: 'Internal Server Error', requestId }), {
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
