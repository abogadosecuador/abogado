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
  
  // Handle static assets via Wrangler [assets] binding
  // First, try to serve the requested path directly from assets
  let assetResponse = await env.ASSETS.fetch(request);
  
  // SPA fallback: if 404 and it's an HTML navigation (no extension), serve index.html
  if (assetResponse.status === 404) {
    const accept = request.headers.get('Accept') || '';
    const isHtmlNavigation = accept.includes('text/html') && !path.includes('.') && request.method === 'GET';
    if (isHtmlNavigation) {
      const indexUrl = new URL('/index.html', request.url);
      assetResponse = await env.ASSETS.fetch(new Request(indexUrl.toString(), request));
    }
  }

  return assetResponse;
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
