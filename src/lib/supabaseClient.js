import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde runtime config
const cfg = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {};
const supabaseUrl = cfg.supabaseUrl || 'https://kbybhgxqdefuquybstqk.supabase.co';
const supabaseAnonKey = cfg.supabaseKey || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  return data?.is_admin || false;
};
