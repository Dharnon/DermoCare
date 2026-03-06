import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/env';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
);
