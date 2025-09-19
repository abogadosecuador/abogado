const runtime = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {};

export const config = {
  api: {
    baseUrl: runtime.apiBaseUrl || 'https://abogados.ecuador.workers.dev/api',
    timeout: runtime.apiTimeout || 30000,
  },
  supabase: {
    url: runtime.supabaseUrl || 'https://kbybhgxqdefuquybstqk.supabase.co',
    anonKey: runtime.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE',
  },
  cloudinary: {
    cloudName: runtime.cloudinaryCloudName || 'dg3s7tqoj',
    apiKey: runtime.cloudinaryApiKey || '673776954212897'
  },
  paypal: {
    clientId: runtime.paypalClientId || 'AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS',
    mode: runtime.paypalMode || 'live',
  },
  contact: {
    email: runtime.contactEmail || 'ecuadorabogado1@gmail.com',
    whatsapp: runtime.contactWhatsapp || '+59398835269',
  },
  n8n: {
    webhookUrl: runtime.n8nWebhookUrl || 'https://n8n-latest-hurl.onrender.com',
  },
  app: {
    url: runtime.appUrl || '/',
    apiUrl: runtime.apiUrl || '/api',
    version: runtime.version || '3.0.0',
  },
};
