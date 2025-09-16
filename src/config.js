const runtime = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {};

export const config = {
  supabase: {
    url: runtime.supabaseUrl || 'https://kbybhgxqdefuquybstqk.supabase.co',
    anonKey: runtime.supabaseKey || '',
  },
  cloudinary: {
    cloudName: runtime.cloudinaryCloudName || 'dg3s7tqoj',
  },
  paypal: {
    clientId: runtime.paypalClientId || '',
  },
  n8n: {
    webhookUrl: runtime.n8nWebhookUrl || '',
  },
  app: {
    url: runtime.appUrl || '/',
    apiUrl: runtime.apiUrl || '/api',
    version: runtime.version || '3.0.0',
  },
};
