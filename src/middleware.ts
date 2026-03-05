import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Copy the session cookies that Supabase may have refreshed during getUser()
 * onto a redirect response so the rotated tokens are never lost.
 */
function redirectWithSessionCookies(
    url: URL | string,
    supabaseResponse: NextResponse,
): NextResponse {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
}

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase env vars in middleware');
        return NextResponse.redirect(new URL('/auth?error=missing_env', request.url));
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // getUser() validates the JWT with the Supabase server and may rotate the
    // session cookies – always use the returned supabaseResponse afterwards so
    // those refreshed cookies reach the browser.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Pass auth callback through immediately (code exchange happens in the route handler)
    if (pathname.startsWith('/auth/callback')) {
        return supabaseResponse;
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth', '/auth/confirm', '/auth/pending'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

    // Redirect unauthenticated users away from protected routes
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('redirect', pathname);
        return redirectWithSessionCookies(url, supabaseResponse);
    }

    if (user) {
        // Single profile fetch – used for both auth-page redirect and route protection
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // Redirect away from the login page once already authenticated
        if (pathname === '/auth') {
            const url = request.nextUrl.clone();
            url.pathname = profile?.role === 'pro' ? '/doctor/dashboard' : '/patient/dashboard';
            return redirectWithSessionCookies(url, supabaseResponse);
        }

        // Protect doctor routes from non-pro users
        if (pathname.startsWith('/doctor') && profile?.role !== 'pro') {
            const url = request.nextUrl.clone();
            url.pathname = '/patient/dashboard';
            return redirectWithSessionCookies(url, supabaseResponse);
        }

        // Protect patient routes from pro users
        if (pathname.startsWith('/patient') && profile?.role === 'pro') {
            const url = request.nextUrl.clone();
            url.pathname = '/doctor/dashboard';
            return redirectWithSessionCookies(url, supabaseResponse);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
