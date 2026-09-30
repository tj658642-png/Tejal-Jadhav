import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

export const supabase = supabaseConfigured
  ? createClient(url!, anon!)
  : null;

export function persistSessionToken(accessToken: string | null) {
  if (accessToken) localStorage.setItem('sb-access-token', accessToken);
  else localStorage.removeItem('sb-access-token');
}
