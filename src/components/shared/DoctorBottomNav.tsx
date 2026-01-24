'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';
import { memo } from 'react';

import { useUIStore } from '@/lib/ui-store';

const navItems = [
    { label: 'Inicio', icon: 'grid_view', segment: 'dashboard' },
    { label: 'Pacientes', icon: 'person', segment: 'patients' },
    { label: 'Agenda', icon: 'calendar_today', segment: 'schedule' },
    { label: 'Tools', icon: 'settings', segment: 'tools' },
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
            href={`/doctor/${item.segment}`}
            prefetch={true}
            className={cn(
                'flex flex-col items-center gap-1 transition-colors duration-200 w-16',
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

export function DoctorBottomNav() {
    const segment = useSelectedLayoutSegment();
    const { fabAction, fabIcon } = useUIStore();

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50',
                'bg-white/90 backdrop-blur-xl',
                'border-t border-neutral-100',
                'px-6 py-4',
                'safe-area-bottom'
            )}
        >
            <div className="max-w-md mx-auto flex justify-between items-center relative">
                {/* First two items */}
                <div className="flex gap-4">
                    {navItems.slice(0, 2).map((item) => (
                        <MemoizedNavItem
                            key={item.segment}
                            item={item}
                            isActive={segment === item.segment}
                        />
                    ))}
                </div>

                {/* Contextual Action Button */}
                <div className="-mt-10 mx-2">
                    <button
                        onClick={() => fabAction?.()}
                        disabled={!fabAction}
                        className={cn(
                            'w-14 h-14 rounded-full',
                            'flex items-center justify-center',
                            'shadow-lg shadow-primary/30',
                            'active:scale-90 transition-all duration-300',
                            fabAction
                                ? 'bg-primary text-white translate-y-0 opacity-100'
                                : 'bg-transparent text-transparent translate-y-4 opacity-0 pointer-events-none'
                        )}
                        aria-label="Acción principal"
                    >
                        <span className="material-symbols-outlined text-3xl">{fabIcon}</span>
                    </button>
                </div>

                {/* Last two items */}
                <div className="flex gap-4">
                    {navItems.slice(2).map((item) => (
                        <MemoizedNavItem
                            key={item.segment}
                            item={item}
                            isActive={segment === item.segment}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
}
