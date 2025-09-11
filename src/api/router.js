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
        
        case 'cart':
          return await this.cartHandler.handle(request, method, action || id);
        
        case 'payments':
          return await this.paymentHandler.handle(request, method, id, action);
        
        case 'availability':
          return await this.appointmentHandler.checkAvailability(request);
        
        case 'documents':
          return await this.documentHandler.handle(request, method, id);
        
        case 'notifications':
          return await this.handleNotifications(request, method, id);
        
        case 'health':
          return await this.healthHandler.check(action || id);
        
        case 'config':
          return this.getConfig();
        
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
