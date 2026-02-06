import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string, value: string, options?: any }[]) {
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

    // Get session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth', '/auth/callback', '/auth/confirm'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

    // Handle auth callback
    if (pathname.startsWith('/auth/callback')) {
        return supabaseResponse;
    }

    // If user is not logged in and trying to access protected routes
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If user is logged in and trying to access auth page
    if (user && pathname === '/auth') {
        // Get user profile to determine role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const url = request.nextUrl.clone();
        if (profile?.role === 'pro') {
            url.pathname = '/doctor/dashboard';
        } else {
            url.pathname = '/patient/dashboard';
        }
        return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_verified')
            .eq('id', user.id)
            .single();

        // Check if user is verified (for production)
        // Patients need to be verified by a professional
        if (profile && !profile.is_verified && pathname !== '/auth/pending') {
            // Allow access but could redirect to pending verification page
            // For now, we'll allow unverified users with a warning
        }

        // Protect doctor routes
        if (pathname.startsWith('/doctor') && profile?.role !== 'pro') {
            const url = request.nextUrl.clone();
            url.pathname = '/patient/dashboard';
            return NextResponse.redirect(url);
        }

        // Protect patient routes
        if (pathname.startsWith('/patient') && profile?.role === 'pro') {
            const url = request.nextUrl.clone();
            url.pathname = '/doctor/dashboard';
            return NextResponse.redirect(url);
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
