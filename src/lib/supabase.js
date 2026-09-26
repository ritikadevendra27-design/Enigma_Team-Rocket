import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://sevzqvzmtgcoxmddhwaw.supabase.co';
let supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || '';

export const isSecretKeyDetected = supabaseAnonKey.startsWith('sb_secret_') || supabaseAnonKey.startsWith('service_role');

if (isSecretKeyDetected) {
  console.error(
    '⚠️ Supabase Security Notice: You provided a secret/service-role key (sb_secret_...) in your frontend .env file. Please replace it with the "anon public" key from Supabase Dashboard -> Project Settings -> API.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'circular_economy_auth_token',
    },
  }
);
