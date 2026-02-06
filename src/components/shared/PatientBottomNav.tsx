'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';
import { memo } from 'react';

const navItems = [
    { label: 'Inicio', icon: 'home', segment: 'dashboard' },
    { label: 'Rutina', icon: 'calendar_today', segment: 'routine' },
    { label: 'Progreso', icon: 'trending_up', segment: 'progress' },
    { label: 'Chat', icon: 'chat_bubble', segment: 'chat' },
    { label: 'Perfil', icon: 'person', segment: 'profile' },
] as const;

function NavItem({
    item,
    isActive,
}: {
    item: (typeof navItems)[number];
    isActive: boolean;
}) {
    return (
        <Link
            href={`/patient/${item.segment}`}
            prefetch={true}
            className={cn(
                'flex flex-col items-center gap-1 transition-colors duration-200',
                'active:scale-90 active:opacity-70',
                isActive ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600'
            )}
        >
            <span
                className="material-symbols-outlined text-2xl"
                style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
            >
                {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
                {item.label}
            </span>
        </Link>
    );
}

const MemoizedNavItem = memo(NavItem);

export function PatientBottomNav() {
    // useSelectedLayoutSegment is more efficient than usePathname
    // It only tracks the current segment, not the full path
    const segment = useSelectedLayoutSegment();

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50',
                'bg-white/90 backdrop-blur-xl',
                'border-t border-neutral-100',
                'px-8 py-4',
                'safe-area-bottom'
            )}
        >
            <div className="max-w-md mx-auto flex justify-between items-center">
                {navItems.map((item) => (
                    <MemoizedNavItem
                        key={item.segment}
                        item={item}
                        isActive={segment === item.segment}
                    />
                ))}
            </div>
        </nav>
    );
}
