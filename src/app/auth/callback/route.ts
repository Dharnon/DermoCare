import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const type = searchParams.get('type');

    if (code) {
        // `sessionCookieResponse` is used purely as a cookie jar while
        // exchangeCodeForSession runs.  The final redirect URL is determined
        // after we know the user's role, at which point the collected cookies
        // are forwarded onto the real redirect response.
        const sessionCookieResponse = NextResponse.redirect(`${origin}/patient/dashboard`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        // Write every session cookie directly onto the redirect
                        // response so the browser receives them in the same
                        // round-trip as the redirect.
                        cookiesToSet.forEach(({ name, value, options }) =>
                            sessionCookieResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                if (type === 'signup' || type === 'email') {
                    await supabase
                        .from('profiles')
                        .update({ email_confirmed_at: new Date().toISOString() })
                        .eq('id', user.id);
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const destination = profile?.role === 'pro'
                    ? `${origin}/doctor/dashboard`
                    : `${origin}/patient/dashboard`;

                // Return a new redirect to the correct destination while
                // preserving all session cookies already set on sessionCookieResponse.
                const finalResponse = NextResponse.redirect(destination);
                sessionCookieResponse.cookies.getAll().forEach((cookie) => {
                    finalResponse.cookies.set(cookie.name, cookie.value, cookie);
                });
                return finalResponse;
            }
        }
    }

    return NextResponse.redirect(`${origin}/auth?error=Could not authenticate`);
}

