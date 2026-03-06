import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from '@/lib/env';
import type { UserRole } from '@/lib/types';

type BootstrapRole = UserRole | null;

function sanitizeRedirectPath(candidate: string | null, role: BootstrapRole) {
    if (candidate && candidate.startsWith('/') && !candidate.startsWith('//')) {
        return candidate;
    }

    return role === 'pro' ? '/doctor/dashboard' : '/patient/dashboard';
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
}

async function ensureOrganization(
    supabase: ReturnType<typeof createServerClient>,
    organizationName: string
) {
    const baseSlug = slugify(organizationName) || 'organizacion';

    const { data: existing } = await supabase
        .from('organizations')
        .select('id, slug')
        .eq('slug', baseSlug)
        .maybeSingle();

    if (existing?.id) {
        return existing.id;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        const { data, error } = await supabase
            .from('organizations')
            .insert({
                name: organizationName.trim(),
                slug,
            })
            .select('id')
            .single();

        if (!error && data?.id) {
            return data.id;
        }
    }

    return null;
}

async function bootstrapUser(
    supabase: ReturnType<typeof createServerClient>,
    user: Awaited<ReturnType<ReturnType<typeof createServerClient>['auth']['getUser']>>['data']['user']
) {
    const metadata = user.user_metadata ?? {};
    const role = metadata.role === 'pro' ? 'pro' : 'patient';
    const name = typeof metadata.name === 'string' ? metadata.name.trim() : '';
    const email = typeof user.email === 'string' ? user.email : null;
    const organizationName =
        typeof metadata.organization_name === 'string' ? metadata.organization_name.trim() : '';
    const invitedBy = typeof metadata.invited_by === 'string' ? metadata.invited_by : null;
    const invitationToken =
        typeof metadata.invitation_token === 'string' ? metadata.invitation_token : null;

    let organizationId =
        typeof metadata.organization_id === 'string' ? metadata.organization_id : null;

    if (role === 'pro' && !organizationId && organizationName) {
        organizationId = await ensureOrganization(supabase, organizationName);
    }

    const profilePayload = {
        id: user.id,
        email,
        name: name || email?.split('@')[0] || 'Usuario',
        role,
        organization_id: organizationId,
        invited_by: invitedBy,
        is_verified: Boolean(user.email_confirmed_at),
        updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
        throw profileError;
    }

    if (invitationToken) {
        await supabase
            .from('invitations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
            })
            .eq('token', invitationToken)
            .eq('status', 'pending');
    }

    return role as BootstrapRole;
}

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next');

    if (!code) {
        return NextResponse.redirect(`${origin}/auth?error=missing_code`);
    }

    const cookieStore = await cookies();
    const { url, anonKey } = getSupabaseEnv();

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    cookieStore.set(name, value, options)
                );
            },
        },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(`${origin}/auth?error=auth_exchange`);
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(`${origin}/auth?error=user_missing`);
    }

    try {
        const role = await bootstrapUser(supabase, user);
        const redirectPath = sanitizeRedirectPath(next, role);
        return NextResponse.redirect(`${origin}${redirectPath}`);
    } catch {
        return NextResponse.redirect(`${origin}/auth?error=bootstrap_failed`);
    }
}
