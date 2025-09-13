import { APIRouter } from './src/api/router.js';
import { CronHandler } from './src/api/handlers/cronHandler.js';

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(new CronHandler(env).handle());
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    
    // Redirección 301 al subdominio canónico en Cloudflare Workers
    // Desde: abogadosecuador.abogadosecuador.workers.dev
    // Hacia:  abogadosecuador.workers.dev
    if (host === 'abogadosecuador.abogadosecuador.workers.dev') {
      const target = `https://abogadosecuador.workers.dev${url.pathname}${url.search}`;
      return Response.redirect(target, 301);
    }
    
    // Manejar solicitudes CORS OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Rutas de API (backend)
    if (url.pathname.startsWith('/api/')) {
      try {
        const router = new APIRouter(env, {});
        return await router.route(request, url.pathname);
      } catch (apiError) {
        console.error('API error:', apiError);
        return new Response(JSON.stringify({ success: false, error: 'API error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    
    try {
      // Pasar solicitudes a través de la función de assets de Cloudflare Pages
      return env.ASSETS.fetch(request);
    } catch (e) {
      // Si falla, intentar redirigir a index.html para SPA
      try {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        return env.ASSETS.fetch(indexRequest);
      } catch (indexError) {
        return new Response('Not found', { status: 404 });
      }
    }
  },
};
