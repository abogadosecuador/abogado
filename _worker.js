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

  // Simple PayPal test page to validate production flow
  if (path === '/pay/test') {
    const clientId = env.PAYPAL_CLIENT_ID || '';
    const currency = 'USD';
    const intent = 'capture';
    const html = `<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Prueba de Pago PayPal</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial; margin: 0; padding: 24px; background:#0b1020; color:#e7eaf6; }
          .card { max-width: 640px; margin: 0 auto; background:#121733; border:1px solid #2a3472; border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,.3); }
          h1 { margin: 0 0 8px; font-size: 20px; }
          p { color: #aab2d5; margin: 0 0 16px; }
          .row { display:flex; gap:16px; align-items:center; margin: 16px 0; }
          .row label { width: 120px; color:#c7cdf1; }
          .row input { flex:1; padding:10px 12px; background:#0b1020; color:#e7eaf6; border:1px solid #2a3472; border-radius: 8px; }
          #paypal-buttons { margin-top: 16px; }
          .log { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background:#0b1020; color:#9bd7ff; border:1px solid #2a3472; border-radius:8px; padding:12px; height:160px; overflow:auto; }
          a { color:#8bd1ff; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Prueba de Pago PayPal (Producción)</h1>
          <p>Este flujo usa la API interna: <code>/api/payments/create-order</code> y <code>/api/payments/capture</code>. Client ID visible es público y los secretos permanecen en el servidor.</p>
          <div class="row">
            <label>Monto (USD)</label>
            <input id="amount" type="number" min="1" step="0.01" value="10.00" />
          </div>
          <div id="paypal-buttons"></div>
          <h3>Logs</h3>
          <div id="log" class="log"></div>
          <p style="margin-top:12px">Si todo funciona correctamente, verá el estado <b>COMPLETED</b>. También puede configurar el webhook en su cuenta PayPal apuntando a <code>/api/payments/webhook</code>.</p>
        </div>
        <script>
          const log = (m) => {
            const el = document.getElementById('log');
            el.textContent += (typeof m === 'string' ? m : JSON.stringify(m, null, 2)) + '\n';
            el.scrollTop = el.scrollHeight;
          };

          let lastPaymentId = null;

          async function createOrder() {
            const amount = parseFloat(document.getElementById('amount').value || '0');
            const res = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, currency: 'USD', description: 'Prueba de pago' })
            });
            const data = await res.json();
            log(['create-order', data]);
            if (!data.success) throw new Error(data.error || 'No se pudo crear la orden');
            lastPaymentId = data.data.payment_id;
            return data.data.paypal_order_id;
          }

          async function onApprove(data) {
            const res = await fetch('/api/payments/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: data.orderID, payment_id: lastPaymentId })
            });
            const result = await res.json();
            log(['capture', result]);
            if (!result.success) alert('Error al capturar: ' + (result.error || ''));
            else alert('Pago completado');
          }
        </script>
        <script src="https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=${intent}"></script>
        <script>
          if (!window.paypal) {
            document.getElementById('paypal-buttons').innerHTML = '<p>No se pudo cargar el SDK de PayPal.</p>';
          } else {
            paypal.Buttons({
              style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
              createOrder: function() { return createOrder(); },
              onApprove: function(data) { return onApprove(data); },
              onError: function(err) { log(['pp-error', err?.message || err]); alert('Error de PayPal'); }
            }).render('#paypal-buttons');
          }
        </script>
      </body>
    </html>`;
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  // Handle static assets via Wrangler [assets] binding with safety guard
  const accept = request.headers.get('Accept') || '';
  const isHtmlNavigation = accept.includes('text/html') && !path.includes('.') && request.method === 'GET';

  if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
    // Safe minimal SPA fallback to prevent 500s during misconfiguration
    if (isHtmlNavigation) {
      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Abogados Ecuador</title></head><body><div id="root" style="font-family:system-ui,Segoe UI,Roboto;max-width:720px;margin:48px auto;padding:16px"><h1>Aplicación en despliegue</h1><p>Los activos estáticos no están disponibles en este entorno. Por favor ejecute la compilación y despliegue.</p><p><a href="/" style="color:#2563eb">Volver al inicio</a></p></div></body></html>`;
      return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    return new Response('Not Found', { status: 404 });
  }

  // First, try to serve the requested path directly from assets
  let assetResponse = await env.ASSETS.fetch(request);

  // SPA fallback: if 404 and it's an HTML navigation (no extension), serve index.html
  if (assetResponse.status === 404 && isHtmlNavigation) {
    const indexUrl = new URL('/index.html', request.url);
    assetResponse = await env.ASSETS.fetch(new Request(indexUrl.toString(), request));
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
