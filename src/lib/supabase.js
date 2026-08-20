import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://cypfpyjjwjktpnvwfodf.supabase.co';
const NEW_SUPABASE_KEY = 'sb_publishable_JRGOVJvinFk1KnObL7R8MQ_axSLiEbu';

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sk_supabase_url') || NEW_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sk_supabase_key') || NEW_SUPABASE_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
};

export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    return createClient(url, key);
  }
  return null;
};

export const supabase = getSupabaseClient();
