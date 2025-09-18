/**
 * Supabase client utilities
 */

import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son obligatorias.');
  }

  // Para operaciones de usuario, siempre se debe usar la clave anónima.
  return createClient(url, key);
}

export async function verifySupabaseToken(token, env) {
  try {
    const supabase = createSupabaseClient(env);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
