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

  const supabaseUrl = window.__APP_CONFIG__?.supabaseUrl;
  const supabaseKey = window.__APP_CONFIG__?.supabaseKey;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Las credenciales de Supabase no están disponibles en window.__APP_CONFIG__.');
    // Devolvemos un objeto nulo o lanzamos un error para detener la ejecución
    // en lugar de usar un cliente de fallback que oculte el problema.
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
export const supabase = getSupabaseClient();

// --- Servicios de Autenticación y Datos ---

/**
 * authService - Proporciona métodos para la autenticación de usuarios.
 */
export const authService = {
  async login(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async register(email, password, userData = {}) {
    return supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: userData } 
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getSession() {
    return supabase.auth.getSession();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

/**
 * dataService - Proporciona métodos para interactuar con la base de datos.
 */
export const dataService = {
  async getAll(table, options = {}) {
    let query = supabase.from(table).select(options.select || '*');
    // Aquí se pueden añadir más opciones como filtros, orden, etc.
    return query;
  },

  async getById(table, id) {
    return supabase.from(table).select('*').eq('id', id).single();
  },

  async create(table, data) {
    return supabase.from(table).insert([data]).select();
  },

  async update(table, id, data) {
    return supabase.from(table).update(data).eq('id', id).select();
  },

  async delete(table, id) {
    return supabase.from(table).delete().eq('id', id);
  }
};
