/**
 * Supabase client utilities
 */

import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  const url = env.SUPABASE_URL || 'https://kbybhgxqdefuquybstqk.supabase.co';
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_KEY;
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY) is not set in environment. Configure it via wrangler secrets.');
  }
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
