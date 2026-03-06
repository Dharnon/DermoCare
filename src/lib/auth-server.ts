import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ProfileRow, UserRole } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface AuthenticatedContext {
    user: User;
    profile: ProfileRow;
}

async function getProfile(
    supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
    userId: string
) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return data as ProfileRow;
}

export async function getInitialAuthState() {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                user: null,
                profile: null,
            };
        }

        return {
            user,
            profile: await getProfile(supabase, user.id),
        };
    } catch {
        return {
            user: null,
            profile: null,
        };
    }
}

export async function requireAuthenticatedProfile(role?: UserRole): Promise<AuthenticatedContext> {
    const { user, profile } = await getInitialAuthState();

    if (!user) {
        redirect('/auth');
    }

    if (!profile) {
        redirect('/auth?error=profile');
    }

    if (role && profile.role !== role) {
        redirect(profile.role === 'pro' ? '/doctor/dashboard' : '/patient/dashboard');
    }

    return { user, profile };
}
