import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';
    const type = searchParams.get('type');

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Called in middleware/server context
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Get user to determine where to redirect
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Check if this is an email confirmation
                if (type === 'signup' || type === 'email') {
                    // Update email_confirmed_at in profile if needed
                    await supabase
                        .from('profiles')
                        .update({ email_confirmed_at: new Date().toISOString() })
                        .eq('id', user.id);
                }

                // Get role for redirect
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const redirectUrl = profile?.role === 'pro'
                    ? '/doctor/dashboard'
                    : '/patient/dashboard';

                return NextResponse.redirect(`${origin}${redirectUrl}`);
            }
        }
    }

    // Return the user to an error page if code exchange failed
    return NextResponse.redirect(`${origin}/auth?error=Could not authenticate`);
}
