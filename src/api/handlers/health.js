/**
 * Health Check Handler
 */

import { corsHeaders } from '../headers.js';

export class HealthHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async check(service) {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      services: {}
    };

    try {
      if (service === 'supabase') {
        checks.services.supabase = await this.checkSupabase();
      } else if (service === 'paypal') {
        checks.services.paypal = await this.checkPayPal();
      } else if (service === 'gemini') {
        checks.services.gemini = await this.checkGemini();
      } else if (service === 'n8n') {
        checks.services.n8n = await this.checkN8N();
      } else if (service === 'cloudinary') {
        checks.services.cloudinary = await this.checkCloudinary();
      } else {
        // Check all services
        checks.services = {
          kv: await this.checkKV(),
          d1: await this.checkD1(),
          supabase: await this.checkSupabase(),
          paypal: await this.checkPayPal(),
          gemini: await this.checkGemini(),
          n8n: await this.checkN8N(),
          cloudinary: await this.checkCloudinary()
        };
      }

      // Determine overall health
      const allHealthy = Object.values(checks.services).every(s => s.status === 'healthy');
      checks.status = allHealthy ? 'healthy' : 'degraded';

      return this.success(checks);
    } catch (error) {
      return this.error('Health check failed', 500);
    }
  }

  async checkKV() {
    try {
      const start = Date.now();
      const testKey = 'health_check_' + Date.now();
      await this.env.ABOGADO_WILSON_KV.put(testKey, 'ok', { expirationTtl: 60 });
      const value = await this.env.ABOGADO_WILSON_KV.get(testKey);
      await this.env.ABOGADO_WILSON_KV.delete(testKey);
      
      return { 
        status: value === 'ok' ? 'healthy' : 'unhealthy',
        latency: Date.now() - start,
        message: 'KV store operational'
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        message: 'KV store not accessible'
      };
    }
  }

  async checkD1() {
    try {
      const start = Date.now();
      const result = await this.env.ABOGADO_WILSON_DB.prepare('SELECT 1 as test').first();
      
      return { 
        status: result?.test === 1 ? 'healthy' : 'unhealthy',
        latency: Date.now() - start,
        message: 'D1 database operational'
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        message: 'D1 database not accessible'
      };
    }
  }

  async checkSupabase() {
    try {
      const start = Date.now();
      const { error } = await this.supabase
        .from('services')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      return { 
        status: 'healthy',
        latency: Date.now() - start,
        message: 'Supabase operational',
        url: this.env.SUPABASE_URL
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        message: 'Supabase not accessible'
      };
    }
  }

  async checkPayPal() {
    try {
      const start = Date.now();
      const auth = btoa(`${this.env.PAYPAL_CLIENT_ID}:${this.env.PAYPAL_CLIENT_SECRET}`);
      
      const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      
      return { 
        status: response.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - start,
        message: response.ok ? 'PayPal API accessible' : 'PayPal API error',
        statusCode: response.status
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        message: 'PayPal API not accessible'
      };
    }
  }

  async checkGemini() {
    if (!this.env.GEMINI_API_KEY) {
      return {
        status: 'disabled',
        message: 'Gemini API key not configured'
      };
    }

    try {
      const start = Date.now();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.env.GEMINI_API_KEY}`
      );
      
      return { 
        status: response.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - start,
        message: response.ok ? 'Gemini API accessible' : 'Gemini API error',
        statusCode: response.status
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        message: 'Gemini API not accessible'
      };
    }
  }

  async checkN8N() {
    if (!this.env.N8N_WEBHOOK_URL) {
      return {
        status: 'disabled',
        message: 'n8n webhook URL not configured'
      };
    }

    try {
      const start = Date.now();
      const response = await fetch(
        `${this.env.N8N_WEBHOOK_URL}/webhook/health`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return { 
        status: response.ok ? 'healthy' : 'degraded',
        latency: Date.now() - start,
        message: response.ok ? 'n8n webhooks accessible' : 'n8n webhooks may be unavailable',
        statusCode: response.status
      };
    } catch (error) {
      return { 
        status: 'degraded', 
        error: error.message,
        message: 'n8n webhooks not responding'
      };
    }
  }

  async checkCloudinary() {
    if (!this.env.CLOUDINARY_API_KEY) {
      return {
        status: 'disabled',
        message: 'Cloudinary API key not configured'
      };
    }

    try {
      const start = Date.now();
      const auth = btoa(`${this.env.CLOUDINARY_API_KEY}:${this.env.CLOUDINARY_API_SECRET || 'MOzrryrl-3w0abD2YftOWYOs3O8'}`);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.env.CLOUDINARY_CLOUD_NAME}/resources/image`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      return { 
        status: response.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - start,
        message: response.ok ? 'Cloudinary API accessible' : 'Cloudinary API error',
        statusCode: response.status
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        message: 'Cloudinary API not accessible'
      };
    }
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
}
