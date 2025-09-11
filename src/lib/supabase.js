/**
 * Supabase client utilities
 */

import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  return createClient(
    env.SUPABASE_URL || 'https://kbybhgxqdefuquybstqk.supabase.co',
    env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE'
  );
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
