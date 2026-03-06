const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv() {
    if (!publicSupabaseUrl) {
        throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!publicSupabaseAnonKey) {
        throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    return {
        url: publicSupabaseUrl,
        anonKey: publicSupabaseAnonKey,
    };
}
