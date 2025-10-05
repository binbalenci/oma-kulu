import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants?.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants?.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throw early to avoid silent failures when environment is not configured
  throw new Error('Missing Supabase configuration. Set extra.supabaseUrl and extra.supabaseAnonKey in app.json');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // no auth in MVP
    autoRefreshToken: false,
  },
});

