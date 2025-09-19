/**
 * supabaseService.js - Servicio refactorizado para la integración con Supabase.
 *
 * Esta versión simplificada asegura una conexión robusta y segura en entornos de Cloudflare,
 * utilizando siempre un proxy CORS y centralizando la configuración.
 */
import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

/**
 * Obtiene la URL base de la aplicación de forma segura.
 * @returns {string} La URL base.
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback para entornos de servidor (aunque esta app es principalmente cliente)
  return '';
};

/**
 * Fetch personalizado que siempre pasa a través del proxy CORS de Cloudflare.
 * Esto estandariza el comportamiento de la red y previene errores de CORS.
 * @param {string|Request} resource - El recurso a solicitar.
 * @param {object} options - Opciones de la solicitud fetch.
 * @returns {Promise<Response>} La respuesta de la solicitud.
 */
const proxiedFetch = (resource, options = {}) => {
  const baseUrl = getBaseUrl();
  // El endpoint de nuestro worker que actúa como proxy
  const proxyUrl = `${baseUrl}/api/proxy`;

  // Modificamos la URL original para que sea un parámetro de nuestro proxy
  const proxiedResource = `${proxyUrl}?url=${encodeURIComponent(resource)}`;

  return fetch(proxiedResource, options);
};

/**
 * Inicializa y devuelve una instancia única del cliente de Supabase.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Usar configuración directa para producción
  const supabaseUrl = window.__APP_CONFIG__?.supabaseUrl || 'https://kbybhgxqdefuquybstqk.supabase.co';
  const supabaseKey = window.__APP_CONFIG__?.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Configuración de Supabase no disponible');
    throw new Error('Configuración de Supabase no encontrada.');
  }

  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      // Forzamos el uso de nuestro fetch con proxy para todas las peticiones de Supabase
      fetch: proxiedFetch,
    },
  };

  supabaseClient = createClient(supabaseUrl, supabaseKey, options);
  return supabaseClient;
};

// Exportamos una única instancia que se inicializará la primera vez que se importe.
// Se exporta la función para asegurar una inicialización diferida (lazy initialization).
// Esto previene errores de 'race condition' al cargar la app.
export const supabase = getSupabaseClient;

// --- Servicios de Autenticación y Datos ---

/**
 * authService - Proporciona métodos para la autenticación de usuarios.
 */
export const authService = {
  async login(email, password) {
    return getSupabaseClient().auth.signInWithPassword({ email, password });
  },

  async register(email, password, metadata = {}) {
    return getSupabaseClient().auth.signUp({ email, password, options: { data: metadata } });
  },

  async logout() {
    return getSupabaseClient().auth.signOut();
  },

  async getUser() {
    return getSupabaseClient().auth.getUser();
  },

  async getCurrentUser() {
    const { data } = await getSupabaseClient().auth.getUser();
    return data.user;
  },
  
  onAuthStateChange(callback) {
    return getSupabaseClient().auth.onAuthStateChange(callback);
  }
};

/**
 * dataService - Proporciona métodos para interactuar con la base de datos.
 */
export const dataService = {
  async getAll(table, { filters = [], select = '*', order = null, limit = null }) {
    let query = getSupabaseClient().from(table).select(select);
    filters.forEach(f => { query = query.eq(f.column, f.value); });
    if (order) query = query.order(order.column, { ascending: order.asc });
    if (limit) query = query.limit(limit);
    return query;
  },

  async get(table, { filters = [], select = '*', single = false }) {
    let query = getSupabaseClient().from(table).select(select);
    filters.forEach(f => { query = query.eq(f.column, f.value); });
    if (single) query = query.single();
    return query;
  },

  async getById(table, id) {
    return getSupabaseClient().from(table).select('*').eq('id', id).single();
  },

  async create(table, data) {
    return getSupabaseClient().from(table).insert(data).select().single();
  },

  async update(table, id, data) {
    return getSupabaseClient().from(table).update(data).eq('id', id).select().single();
  },

  async delete(table, id) {
    return getSupabaseClient().from(table).delete().eq('id', id);
  }
};
