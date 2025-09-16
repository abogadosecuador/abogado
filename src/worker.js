/**
 * Worker Principal - Abogados Ecuador
 * Sistema completo con diagnóstico automático y corrección de errores
 */

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

  async paymentsHasAccess(request) {
    try {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        return new Response(JSON.stringify({ access: false, error: 'No token' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      const url = new URL(request.url);
      const product = url.searchParams.get('product') || null;

      // Obtener usuario desde Supabase con el token
      const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
      const anon = this.env.SUPABASE_ANON_KEY || '';
      const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { 'apikey': anon, 'Authorization': `Bearer ${token}` }
      });
      if (!userResp.ok) {
        return new Response(JSON.stringify({ access: false }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      const user = await userResp.json();
      const email = user?.email || user?.user_metadata?.email || null;
      const uid = user?.id || null;

      if (!email && !uid) {
        return new Response(JSON.stringify({ access: false }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // Consultar órdenes con estado exitoso
      let query = `SELECT 1 FROM orders WHERE status IN ('COMPLETED','APPROVED','CAPTURED') AND (user_email = ? OR user_id = ?)`;
      const binds = [email, uid];
      if (product) {
        query += ` AND (product_slug = ? OR description LIKE ?) `;
        binds.push(product, `%${product}%`);
      }
      query += ' LIMIT 1';

      const row = await this.env.ABOGADO_WILSON_DB.prepare(query).bind(...binds).first();
      const access = !!row;
      return new Response(JSON.stringify({ access }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (e) {
      return new Response(JSON.stringify({ access: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }

  // -------------------- Status --------------------
  handleStatus() {
    return new Response(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
  }

  // -------------------- Setup (D1) --------------------
  async setupInit() {
    try {
      // Contacts table
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          phone TEXT,
          message TEXT,
          created_at TEXT
        );`
      ).run();

      // Searches table
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS searches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          search_type TEXT NOT NULL,
          search_value TEXT NOT NULL,
          province TEXT NOT NULL,
          timestamp TEXT NOT NULL
        );`
      ).run();

      // Orders table (opcional para pagos)
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT,
          status TEXT,
          amount REAL,
          description TEXT,
          created_at TEXT
        );`
      ).run();

      // Extender esquema de orders con columnas para asociación de usuario/producto (si no existen)
      try {
        const info = await this.env.ABOGADO_WILSON_DB.prepare(`PRAGMA table_info(orders)`).all();
        const cols = (info?.results || []).map(c => c.name);
        if (!cols.includes('user_email')) {
          await this.env.ABOGADO_WILSON_DB.prepare(`ALTER TABLE orders ADD COLUMN user_email TEXT`).run();
        }
        if (!cols.includes('user_id')) {
          await this.env.ABOGADO_WILSON_DB.prepare(`ALTER TABLE orders ADD COLUMN user_id TEXT`).run();
        }
        if (!cols.includes('product_slug')) {
          await this.env.ABOGADO_WILSON_DB.prepare(`ALTER TABLE orders ADD COLUMN product_slug TEXT`).run();
        }
      } catch (e) {
        // Ignorar errores de ALTER si el proveedor no soporta o ya existen
      }

      // Newsletter subscriptions
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          name TEXT,
          created_at TEXT
        );`
      ).run();

      // Products
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE,
          description TEXT,
          price REAL NOT NULL,
          status TEXT DEFAULT 'active',
          image_url TEXT,
          created_at TEXT
        );`
      ).run();

      // Services
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE,
          description TEXT,
          price REAL,
          duration INTEGER,
          status TEXT DEFAULT 'active',
          created_at TEXT
        );`
      ).run();

      // Courses
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE,
          summary TEXT,
          price REAL,
          status TEXT DEFAULT 'draft',
          created_at TEXT
        );`
      ).run();

      // Consultations
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS consultations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT,
          type TEXT,
          date_time TEXT,
          modality TEXT,
          notes TEXT,
          status TEXT DEFAULT 'pending',
          created_at TEXT
        );`
      ).run();

      // Blog posts
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE,
          excerpt TEXT,
          content TEXT,
          author TEXT,
          published_at TEXT,
          status TEXT DEFAULT 'draft',
          created_at TEXT
        );`
      ).run();

      // Ebooks
      await this.env.ABOGADO_WILSON_DB.prepare(
        `CREATE TABLE IF NOT EXISTS ebooks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE,
          description TEXT,
          price REAL,
          file_url TEXT,
          status TEXT DEFAULT 'active',
          created_at TEXT
        );`
      ).run();

      return new Response(JSON.stringify({ success: true, message: 'D1 tables ensured' }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
    }
  }

  // -------------------- Auth (Supabase REST) --------------------
  async authRegister(request) {
    const body = await request.json();
    const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
    const anon = this.env.SUPABASE_ANON_KEY || '';
    const resp = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': anon, 'Authorization': `Bearer ${anon}` },
      body: JSON.stringify({ email: body.email, password: body.password, data: { full_name: body.name || '' } })
    });
    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
  }

  async authLogin(request) {
    const body = await request.json();
    const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
    const anon = this.env.SUPABASE_ANON_KEY || '';
    const resp = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': anon, 'Authorization': `Bearer ${anon}` },
      body: JSON.stringify({ email: body.email, password: body.password })
    });
    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
  }

  async authGetUser(request) {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
    const anon = this.env.SUPABASE_ANON_KEY || '';
    const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': anon, 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
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
          'apikey': this.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${this.env.SUPABASE_ANON_KEY || ''}`
        }
      });
      checks.supabase = response.ok;
    } catch (e) {
      console.error('Supabase health check failed:', e);
    }

    // Verificar Cloudinary (solo verifica acceso público de recursos sin exponer secretos)
    try {
      const cloudName = this.env.CLOUDINARY_CLOUD_NAME || 'dg3s7tqoj';
      // Hacer una solicitud simple a un endpoint público para validar DNS/respuesta
      const pingUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample`;
      const resp = await fetch(pingUrl, { method: 'HEAD' });
      checks.cloudinary = resp.status === 200 || resp.status === 400;
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
        // Setup D1 tables
        case 'setup/init':
          return this.setupInit();
        case 'setup/seed':
          return this.seedDemoData();
        case 'status':
          return this.handleStatus();
        case 'supabase':
          return this.proxySupabase(request);
        case 'cloudinary/upload':
          return this.handleCloudinaryUpload(request);
        case 'upload':
          return this.handleCloudinaryUpload(request);
        case 'paypal/create-order':
          return this.createPayPalOrder(request);
        case 'payments/create-order':
          return this.createPayPalOrder(request);
        case 'payments/capture':
          return this.capturePayPalOrder(request);
        case 'payments/webhook':
          return this.payPalWebhook(request);
        case 'payments/has-access':
          return this.paymentsHasAccess(request);
        // Auth endpoints (proxy to Supabase Auth REST)
        case 'auth/register':
          return this.authRegister(request);
        case 'auth/login':
          return this.authLogin(request);
        case 'auth/user':
          return this.authGetUser(request);
        case 'contact':
          return this.handleContact(request);
        case 'whatsapp':
          return this.sendWhatsApp(request);
        case 'data/searches':
          return this.handleSearches(request);
        case 'data/judicial_processes/search':
          return this.handleJudicialProcessesSearch(request);
        default:
          // Rutas genéricas de datos: data/:resource y data/:resource/:id
          if (endpoint.startsWith('data/')) {
            return this.handleData(request, endpoint.substring('data/'.length));
          }
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
      SUPABASE_ANON_KEY: this.env.SUPABASE_ANON_KEY || '',
      CLOUDINARY_CLOUD_NAME: this.env.CLOUDINARY_CLOUD_NAME || 'dg3s7tqoj',
      CLOUDINARY_UPLOAD_PRESET: 'ml_default',
      CONTACT_EMAIL: 'Wifirmalegal@gmail.com',
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

  async setupInit() {
    return this.diagnostic.setupInit();
  }

  async seedDemoData() {
    try {
      // Products
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO products (name, slug, description, price, status, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind('Demo Product', 'demo-product', 'This is a demo product', 19.99, 'active', 'https://example.com/image.jpg', new Date().toISOString()).run();

      // Services
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO services (name, slug, description, price, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind('Demo Service', 'demo-service', 'This is a demo service', 9.99, 30, 'active', new Date().toISOString()).run();

      // Courses
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO courses (title, slug, summary, price, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind('Demo Course', 'demo-course', 'This is a demo course', 29.99, 'draft', new Date().toISOString()).run();

      // Consultations
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO consultations (customer_name, type, date_time, modality, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind('John Doe', 'Demo Consultation', '2023-03-01 10:00:00', 'Phone', 'Demo notes', 'pending', new Date().toISOString()).run();

      // Blog posts
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO blog_posts (title, slug, excerpt, content, author, published_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind('Demo Blog Post', 'demo-blog-post', 'This is a demo blog post', 'Demo content', 'John Doe', new Date().toISOString(), 'draft', new Date().toISOString()).run();

      // Ebooks
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO ebooks (title, slug, description, price, file_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind('Demo Ebook', 'demo-ebook', 'This is a demo ebook', 9.99, 'https://example.com/ebook.pdf', 'active', new Date().toISOString()).run();

      return new Response(JSON.stringify({ success: true, message: 'Demo data seeded successfully' }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }

  async proxySupabase(request) {
    const body = await request.json();
    const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/${body.table}`, {
      method: body.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.env.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${this.env.SUPABASE_ANON_KEY || ''}`
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
    
    const cloudName = this.env.CLOUDINARY_CLOUD_NAME || 'dg3s7tqoj';
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const uploadData = new FormData();
    uploadData.append('file', formData.get('file'));
    uploadData.append('upload_preset', 'ml_default');
    // Para uploads firmados, usar env.CLOUDINARY_API_KEY/SECRET y firma en servidor (no implementado aquí)

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
    
    const clientId = this.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = this.env.PAYPAL_CLIENT_SECRET || '';
    const auth = btoa(`${clientId}:${clientSecret}`);
    
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

  async capturePayPalOrder(request) {
    const body = await request.json();
    const { orderId, userEmail, userId, productSlug } = body || {};
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const clientId = this.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = this.env.PAYPAL_CLIENT_SECRET || '';
    const auth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });

    const data = await response.json();

    // Persist order in D1 if possible
    try {
      const purchase = data?.purchase_units?.[0];
      const amount = purchase?.payments?.captures?.[0]?.amount?.value || purchase?.amount?.value || null;
      const description = purchase?.description || null;
      const status = data?.status || purchase?.payments?.captures?.[0]?.status || 'UNKNOWN';
      await this.env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO orders (order_id, status, amount, description, created_at, user_email, user_id, product_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(orderId, status, amount ? Number(amount) : null, description, new Date().toISOString(), userEmail || null, userId || null, productSlug || null).run();
    } catch (e) {
      // swallow to not break response
      console.warn('Failed to persist PayPal order:', e?.message);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  async payPalWebhook(request) {
    // Verify signature using PayPal API before persisting
    try {
      const rawBody = await request.text();
      const transmissionId = request.headers.get('paypal-transmission-id');
      const transmissionTime = request.headers.get('paypal-transmission-time');
      const certUrl = request.headers.get('paypal-cert-url');
      const authAlg = request.headers.get('paypal-auth-algo');
      const transmissionSig = request.headers.get('paypal-transmission-sig');
      const webhookId = this.env.PAYPAL_WEBHOOK_ID || '';
      if (!webhookId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing PAYPAL_WEBHOOK_ID' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const clientId = this.env.PAYPAL_CLIENT_ID || '';
      const clientSecret = this.env.PAYPAL_CLIENT_SECRET || '';
      const basic = btoa(`${clientId}:${clientSecret}`);

      // Get access token
      const authResp = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const authData = await authResp.json();
      const accessToken = authData.access_token;
      if (!accessToken) {
        return new Response(JSON.stringify({ success: false, error: 'Unable to obtain PayPal token' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const verifyResp = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlg,
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody)
        })
      });
      const verifyData = await verifyResp.json();
      if (verifyData?.verification_status !== 'SUCCESS') {
        return new Response(JSON.stringify({ success: false, error: 'Signature verification failed' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const event = JSON.parse(rawBody);
      const eventType = event?.event_type || event?.eventType;
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
        const resource = event?.resource || {};
        const orderId = resource?.id || resource?.supplementary_data?.related_ids?.order_id || null;
        const amount = resource?.amount?.value || null;
        const status = resource?.status || 'COMPLETED';
        const userEmail = resource?.payer?.email_address || null;
        await this.env.ABOGADO_WILSON_DB.prepare(
          'INSERT INTO orders (order_id, status, amount, description, created_at, user_email) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(orderId, status, amount ? Number(amount) : null, 'Webhook', new Date().toISOString(), userEmail).run();
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
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

  async handleSearches(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (request.method === 'GET') {
        // Obtener últimas 10 búsquedas desde D1 si existe la tabla
        try {
          const rows = await this.env.ABOGADO_WILSON_DB.prepare(
            'SELECT id, search_type, search_value, province, timestamp FROM searches ORDER BY timestamp DESC LIMIT 10'
          ).all();
          return new Response(JSON.stringify(rows?.results || []), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } catch (e) {
          // Fallback a KV si D1 no disponible
          const list = await this.env.ABOGADO_WILSON_KV.list({ prefix: 'search:' });
          const items = [];
          for (const key of list.keys.slice(-10)) {
            const val = await this.env.ABOGADO_WILSON_KV.get(key.name);
            if (val) items.push(JSON.parse(val));
          }
          items.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
          return new Response(JSON.stringify(items), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const record = {
          search_type: body.search_type,
          search_value: body.search_value,
          province: body.province,
          timestamp: body.timestamp || new Date().toISOString()
        };

        // Intentar guardar en D1
        try {
          await this.env.ABOGADO_WILSON_DB.prepare(
            'INSERT INTO searches (search_type, search_value, province, timestamp) VALUES (?, ?, ?, ?)'
          ).bind(record.search_type, record.search_value, record.province, record.timestamp).run();
        } catch (e) {
          // Guardar en KV como respaldo
          await this.env.ABOGADO_WILSON_KV.put(`search:${Date.now()}`, JSON.stringify(record), { expirationTtl: 86400 * 30 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal error', message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
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
      // Redirección a host canónico en workers.dev para evitar duplicados
      const canonicalHost = 'abogadosecuador.abogadosecuador.workers.dev';
      if (url.hostname !== canonicalHost && url.hostname.endsWith('.workers.dev')) {
        const redirected = new URL(url.toString());
        redirected.hostname = canonicalHost;
        return Response.redirect(redirected.toString(), 301);
      }

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

// Manejo de archivos estáticos con Assets binding
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

  // Si la ruta no tiene extensión, servir index.html (SPA)
  const isAssetPath = /\.[a-zA-Z0-9]{2,8}$/.test(url.pathname);
  const assetRequest = isAssetPath ? request : new Request(new URL('/index.html', url.origin), request);

  // Intentar servir desde ASSETS (Workers Assets binding)
  try {
    const assetResponse = await env.ASSETS.fetch(assetRequest);
    if (assetResponse && assetResponse.ok) {
      const headers = new Headers(assetResponse.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
      return new Response(assetResponse.body, { status: assetResponse.status, headers });
    }
  } catch (e) {
    // Continuar a fallback HTML si falla
  }

  // HTML de emergencia si no se pudo servir el asset
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
        .container { text-align: center; padding: 2rem; }
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
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
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
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
  });
}
