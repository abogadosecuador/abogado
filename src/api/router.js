        /**
 * API Router - Main routing logic
 */

import { AuthHandler } from './handlers/auth.js';
import { AppointmentHandler } from './handlers/appointments.js';
import { PaymentHandler } from './handlers/payments.js';
import { CartHandler } from './handlers/cart.js';
import { DocumentHandler } from './handlers/documents.js';
import { ServiceHandler } from './handlers/services.js';
import { HealthHandler } from './handlers/health.js';
import { FormsHandler } from './handlers/forms.js';
import { AdminHandler } from './handlers/admin.js';
import { AiDocumentHandler } from './handlers/aiDocumentHandler.js';
import { SubscriptionHandler } from './handlers/subscriptionHandler.js';
import { GamificationHandler } from './handlers/gamificationHandler.js';
import { CourseContentHandler } from './handlers/courseContentHandler.js';
import { UserContentHandler } from './handlers/userContentHandler.js';
import { AiConsultationHandler } from './handlers/aiConsultationHandler.js';
import { corsHeaders } from './headers.js';
import { createSupabaseClient } from '../lib/supabase.js';
import { RateLimiter } from '../lib/rate-limiter.js';

export class APIRouter {
  constructor(env, ctx) {
    this.env = env;
    this.ctx = ctx;
    this.supabase = createSupabaseClient(env);
    this.rateLimiter = new RateLimiter(env);
    
    // Initialize handlers
    this.authHandler = new AuthHandler(env, this.supabase);
    this.appointmentHandler = new AppointmentHandler(env, this.supabase);
    this.paymentHandler = new PaymentHandler(env, this.supabase);
    this.cartHandler = new CartHandler(env, this.supabase);
    this.documentHandler = new DocumentHandler(env, this.supabase);
    this.serviceHandler = new ServiceHandler(env, this.supabase);
    this.healthHandler = new HealthHandler(env, this.supabase);
    this.formsHandler = new FormsHandler(env, this.supabase);
    this.adminHandler = new AdminHandler(env, this.supabase);
    this.aiDocumentHandler = new AiDocumentHandler(env, this.supabase);
    this.subscriptionHandler = new SubscriptionHandler(env, this.supabase);
    this.gamificationHandler = new GamificationHandler(env, this.supabase);
    this.courseContentHandler = new CourseContentHandler(env, this.supabase);
    this.userContentHandler = new UserContentHandler(env, this.supabase);
    this.aiConsultationHandler = new AiConsultationHandler(env, this.supabase);
    // Bank transfer disabled: only PayPal is allowed in production
  }

  async cloudinaryList(request) {
    try {
      const url = new URL(request.url);
      const prefix = url.searchParams.get('prefix') || '';
      const max = Number(url.searchParams.get('max_results') || '50');
      const cloudName = this.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = this.env.CLOUDINARY_API_KEY;
      const apiSecret = this.env.CLOUDINARY_API_SECRET;
      if (!cloudName || !apiKey || !apiSecret) {
        return this.error('Missing Cloudinary credentials', 500);
      }
      const auth = 'Basic ' + btoa(`${apiKey}:${apiSecret}`);
      const apiUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image` + (prefix ? `?prefix=${encodeURIComponent(prefix)}&max_results=${max}` : `?max_results=${max}`);
      const res = await fetch(apiUrl, { headers: { Authorization: auth } });
      const json = await res.json();
      if (!res.ok) {
        return this.error(json?.error?.message || 'Cloudinary error', 500);
      }
      const items = Array.isArray(json?.resources) ? json.resources.map(r => ({
        public_id: r.public_id,
        format: r.format,
        url: r.secure_url,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        created_at: r.created_at,
      })) : [];
      return this.success(items);
    } catch (e) {
      return this.error(e.message || 'Cloudinary list error', 500);
    }
  }

  async route(request, pathname) {
    // Check rate limiting
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const isAllowed = await this.rateLimiter.checkLimit(clientIp);
    
    if (!isAllowed) {
      return this.error('Rate limit exceeded', 429);
    }

    const method = request.method;
    const segments = pathname.split('/').filter(s => s);
    
    // Remove 'api' prefix
    if (segments[0] === 'api') {
      segments.shift();
    }

    const resource = segments[0];
    const id = segments[1];
    const action = segments[2];

    // Route to appropriate handler
    try {
      switch (resource) {
        case 'auth':
          return await this.authHandler.handle(request, action || id);
        
        case 'appointments':
          return await this.appointmentHandler.handle(request, method, id, action);
        
        case 'services':
          return await this.serviceHandler.handle(request, method, id);
        
        case 'products':
          return await this.serviceHandler.handleProducts(request, method, id);
        
        case 'courses':
          // This route is for public/user access to course content
          return await this.courseContentHandler.handle(request, method, id, action);
        
        case 'user':
          return await this.userContentHandler.handle(request, method, id);
        
        case 'cart':
          return await this.cartHandler.handle(request, method, action || id);
        
        case 'payments': {
          // Compatibilidad de rutas:
          // POST /api/payments/create-order
          // POST /api/payments/capture
          // POST /api/payments/refund/:id
          // POST /api/payments/webhook
          // GET  /api/payments/:id?
          let effectiveId = id;
          let effectiveAction = action;

          if (method === 'POST') {
            // Si es POST y solo hay un segmento (p.ej. create-order|capture|webhook)
            if (id && !action) {
              if (['create-order', 'capture', 'webhook'].includes(id)) {
                effectiveAction = id;
                effectiveId = undefined;
              }
            }
            // Refund con id en segundo segmento
            if (id === 'refund' && action) {
              effectiveAction = 'refund';
              effectiveId = action; // aquí action es el id de pago
            }
          }

          return await this.paymentHandler.handle(request, method, effectiveId, effectiveAction);
        }
        
        case 'availability':
          return await this.appointmentHandler.checkAvailability(request);
        
        case 'documents':
          return await this.documentHandler.handle(request, method, id);

        case 'ai':
          if (id === 'documents' && action === 'generate' && method === 'POST') {
            return await this.aiDocumentHandler.handle(request);
          }
          if (id === 'consultation' && method === 'POST') {
            return await this.aiConsultationHandler.handle(request);
          }
          return this.notFound();

        case 'subscriptions':
            return await this.subscriptionHandler.handle(request, method, id);

        case 'gamification':
            return await this.gamificationHandler.handle(request, method, id);
        
        case 'notifications':
          return await this.handleNotifications(request, method, id);
        
        case 'health':
          return await this.healthHandler.check(action || id);
        
        case 'status':
          return this.success({ status: 'ok', time: Date.now() });
        
        case 'config':
          return this.getConfig();
        
        case 'forms':
          return await this.formsHandler.handle(request, method, id, action);

        case 'cloudinary': {
          // GET /api/cloudinary/list?prefix=&max_results=50
          if (method === 'GET' && (id === 'list' || !id)) {
            return await this.cloudinaryList(request);
          }
          return this.methodNotAllowed();
        }

        case 'admin':
          return await this.adminHandler.handle(request, method, id); // id here represents the resource, e.g., 'users'
        
        // case 'bank-transfer': // Disabled
        //   return this.notFound();

        case 'proxy': {
          // POST /api/proxy - restricted proxy for Supabase only
          if (method !== 'POST') return this.methodNotAllowed();
          try {
            const { url, method: proxyMethod = 'GET', headers = {}, body } = await request.json();
            if (!url || typeof url !== 'string') return this.error('URL requerida', 400);
            const target = new URL(url);
            // Seguridad: solo permitir dominios de Supabase
            if (!/\.supabase\.co$/.test(target.hostname)) {
              return this.error('Dominio no permitido', 403);
            }
            const proxyRes = await fetch(url, {
              method: proxyMethod,
              headers,
              body: ['GET','HEAD'].includes(proxyMethod.toUpperCase()) ? undefined : body
            });
            const buf = await proxyRes.arrayBuffer();
            const hdrs = new Headers(proxyRes.headers);
            // Asegurar CORS seguro
            hdrs.set('Access-Control-Allow-Origin', '*');
            return new Response(buf, { status: proxyRes.status, headers: hdrs });
          } catch (e) {
            console.error('Proxy error:', e);
            return this.error('Proxy error', 502);
          }
        }

        case 'data': {
          // Minimal endpoints para evitar 404 en UI existente
          if (id === 'searches' && method === 'GET') {
            return this.success([]);
          }
          return this.notFound();
        }
        
        default:
          return this.notFound();
      }
    } catch (error) {
      console.error('API Router error:', error);
      return this.error(error.message || 'Internal server error', 500);
    }
  }

  async handleNotifications(request, method, id) {
    const user = await this.authHandler.authenticate(request);
    
    if (!user) {
      return this.unauthorized();
    }

    switch (method) {
      case 'GET':
        if (id) {
          return this.getNotification(id, user);
        }
        return this.listNotifications(user);
      
      case 'PATCH':
        return this.markNotificationRead(id, user);
      
      default:
        return this.methodNotAllowed();
    }
  }

  async listNotifications(user) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.sub)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async getNotification(id, user) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.sub)
      .single();

    if (error) {
      return this.error(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return this.success(data);
  }

  async markNotificationRead(id, user) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.sub);

    if (error) {
      return this.error(error.message);
    }

    return this.success({ message: 'Notification marked as read' });
  }

  getConfig() {
    return this.success({
      supabase_url: this.env.SUPABASE_URL,
      supabase_anon_key: this.env.SUPABASE_ANON_KEY || this.env.SUPABASE_KEY,
      paypal_client_id: this.env.PAYPAL_CLIENT_ID,
      cloudinary_cloud_name: this.env.CLOUDINARY_CLOUD_NAME,
      app_url: this.env.APP_URL,
      app_version: '3.0.0',
      features: {
        auth: true,
        appointments: true,
        payments: true,
        documents: true,
        notifications: true,
        ai: !!this.env.GEMINI_API_KEY
      }
    });
  }

  // Response helpers
  success(data, status = 200) {
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({
      success: false,
      error: message
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  unauthorized() {
    return this.error('Unauthorized', 401);
  }

  notFound() {
    return this.error('Not found', 404);
  }

  methodNotAllowed() {
    return this.error('Method not allowed', 405);
  }
}
