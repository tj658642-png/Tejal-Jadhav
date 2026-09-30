import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '../config/env.js';

export function createSupabaseAdmin() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }
  return createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseAuthClient(token: string) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase auth is not configured');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
