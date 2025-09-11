/**
 * Enhanced Worker - Abogados Ecuador
 * Complete system with Supabase Auth, Calendar, Payments, and AI
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { APIRouter } from './api/router.js';
import { corsHeaders, securityHeaders } from './api/headers.js';

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      // API routes
      if (url.pathname.startsWith('/api/')) {
        const router = new APIRouter(env, ctx);
        return await router.route(request, url.pathname);
      }

      // Static assets and SPA
      return await handleStaticAssets(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      
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
};

// Static asset handler
async function handleStaticAssets(request, env, ctx) {
  const url = new URL(request.url);

  // Special handling for favicon
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
    Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(asset.body, {
      status: 200,
      headers
    });
  } catch (e) {
    // Try index.html for SPA routes
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
      Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(asset.body, {
        status: 200,
        headers
      });
    } catch (fallbackError) {
      // Emergency HTML fallback
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
