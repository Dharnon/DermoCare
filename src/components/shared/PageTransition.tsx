'use client';

import { usePathname } from 'next/navigation';

interface PageTransitionProps {
    children: React.ReactNode;
}

/**
 * PageTransition wrapper that provides smooth animations
 * while avoiding jitter on navigation.
 * 
 * Uses CSS animations that only trigger on initial mount,
 * not on subsequent navigations within the same layout.
 */
export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <div
            key={pathname}
            className="page-transition"
        >
            {children}
        </div>
    );
}
