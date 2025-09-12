// Unifique el cliente de Supabase en toda la app para evitar múltiples instancias de GoTrueClient.
// Reexporta el singleton definido en services/supabaseService.js
export { supabase, getSupabaseClient as getSupabase } from '../services/supabaseService';
