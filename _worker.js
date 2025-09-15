// SPA fallback for Cloudflare Workers
const ASSET_MANIFEST = {
  '': '/index.html',
  '/': '/index.html',
  'index.html': '/index.html'
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Handle API routes
  if (path.startsWith('/api/')) {
    try {
      const { APIRouter } = await import('./src/api/router.js');
      const router = new APIRouter(env, {});
      return await router.route(request, path);
    } catch (error) {
      console.error('API error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API error',
        message: error.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  // Handle static assets
  const assetPath = ASSET_MANIFEST[path] || path;
  const baseOrigin = env.APP_URL || (new URL(request.url)).origin;
  const assetUrl = new URL(assetPath, baseOrigin);
  
  try {
    // Try to get from KV store first
    let response = await env.ABOGADO_WILSON_KV.get(assetPath, { type: 'arrayBuffer' });
    
    if (response) {
      // If found in KV, create a response from the cached data
      const metadata = await env.ABOGADO_WILSON_KV.getWithMetadata(assetPath);
      return new Response(response, {
        headers: {
          ...(metadata.metadata?.headers || { 'Content-Type': 'text/plain' }),
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // If not in KV, fetch from origin
    response = await fetch(assetUrl.toString(), request);
    
    // Cache successful responses
    if (response.status === 200) {
      const cacheResponse = response.clone();
      const headers = new Headers(cacheResponse.headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      
      await env.ABOGADO_WILSON_KV.put(
        assetPath,
        await cacheResponse.arrayBuffer(),
        { metadata: { headers: Object.fromEntries(headers.entries()) }}
      );
    }
    
    return response;
  } catch (error) {
    console.error('Asset fetch error:', error);
    
    // For SPA routing, return index.html for HTML requests
    const acceptHeader = request.headers.get('Accept') || '';
    if (acceptHeader.includes('text/html') && !path.includes('.')) {
      const indexHtml = await env.ABOGADO_WILSON_KV.get('/index.html', { type: 'text' });
      if (indexHtml) {
        return new Response(indexHtml, {
          headers: { 
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    
    return new Response('Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Unhandled error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  },
  
  async scheduled(event, env, ctx) {
    // Handle scheduled tasks if needed
  }
};
