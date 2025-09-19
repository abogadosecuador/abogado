import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

// Professional Cloudflare Worker for React App
// Handles static assets and SPA routing perfectly

const SPA_ROUTES = [
  '/login', '/register', '/dashboard', '/services', '/contact', 
  '/blog', '/catalog', '/masterclass', '/about', '/profile'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Try to serve static assets
      try {
        return await getAssetFromKV(request, {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
        });
      } catch (e) {
        // If asset not found, check if it's a SPA route
        const { pathname } = url;
        const isSpaRoute = SPA_ROUTES.some(route => 
          pathname === route || pathname.startsWith(`${route}/`)
        );
        
        // Serve index.html for SPA routes
        if (isSpaRoute || (!pathname.includes('.') && pathname !== '/')) {
          const indexRequest = new Request(
            new URL('/index.html', request.url).toString(),
            request
          );
          
          return await getAssetFromKV(indexRequest, {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
          });
        }
        
        // Return 404 for other missing assets
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
