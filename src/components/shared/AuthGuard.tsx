'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, profile, isLoading } = useAuth();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Wait until auth finishes loading
        if (isLoading) return;

        const isProtectedRoute =
            pathname.startsWith('/patient/') ||
            pathname.startsWith('/doctor/');

        // Not logged in on a protected route → send to login
        if (isProtectedRoute && !user) {
            router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // All checks passed
        setChecked(true);
    }, [isLoading, user, profile, pathname, router]);

    // Show spinner only while auth is loading
    if (isLoading || !checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return <>{children}</>;
}
