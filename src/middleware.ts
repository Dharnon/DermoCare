import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseEnv } from '@/lib/env';

const PUBLIC_PATHS = new Set([
    '/',
    '/auth',
    '/auth/callback',
    '/auth/pending',
]);

function normalizePath(pathname: string) {
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }

    return pathname;
}

function isPublicPath(pathname: string) {
    const normalizedPath = normalizePath(pathname);

    if (PUBLIC_PATHS.has(normalizedPath)) {
        return true;
    }

    return normalizedPath.startsWith('/invite/');
}

function buildAuthRedirect(request: NextRequest) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth';

    if (!loginUrl.searchParams.has('redirect') && request.nextUrl.pathname !== '/auth') {
        const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
        loginUrl.searchParams.set('redirect', redirectTarget);
    }

    return loginUrl;
}

async function getProfileRole(request: NextRequest, userId: string) {
    const { url, anonKey } = getSupabaseEnv();
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });

                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });

                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    return {
        role: profile?.role as 'pro' | 'patient' | undefined,
        response,
    };
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const normalizedPath = normalizePath(pathname);
    const isProtectedDoctorRoute = normalizedPath.startsWith('/doctor/');
    const isProtectedPatientRoute = normalizedPath.startsWith('/patient/');
    const shouldCheckAuthPage = normalizedPath === '/auth';

    if (!isProtectedDoctorRoute && !isProtectedPatientRoute && !shouldCheckAuthPage && isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const { url, anonKey } = getSupabaseEnv();
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });

                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });

                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        if (isProtectedDoctorRoute || isProtectedPatientRoute) {
            return NextResponse.redirect(buildAuthRedirect(request));
        }

        return response;
    }

    const { role, response: profileResponse } = await getProfileRole(request, user.id);
    response = profileResponse;

    if (!role) {
        // Allow user to stay on auth pages without creating a redirect loop.
        if (normalizedPath === '/auth' || normalizedPath === '/auth/pending') {
            return response;
        }

        const incompleteAuthUrl = request.nextUrl.clone();
        incompleteAuthUrl.pathname = '/auth';
        incompleteAuthUrl.searchParams.set('error', 'profile');
        return NextResponse.redirect(incompleteAuthUrl);
    }

    if (shouldCheckAuthPage) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = role === 'pro' ? '/doctor/dashboard' : '/patient/dashboard';
        dashboardUrl.search = '';
        return NextResponse.redirect(dashboardUrl);
    }

    if (isProtectedDoctorRoute && role !== 'pro') {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/patient/dashboard';
        dashboardUrl.search = '';
        return NextResponse.redirect(dashboardUrl);
    }

    if (isProtectedPatientRoute && role !== 'patient') {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/doctor/dashboard';
        dashboardUrl.search = '';
        return NextResponse.redirect(dashboardUrl);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
