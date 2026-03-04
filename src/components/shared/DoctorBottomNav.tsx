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
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">
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
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav
                className={cn(
                    'w-full max-w-[380px] pointer-events-auto',
                    'bg-white/90 backdrop-blur-xl',
                    'border border-neutral-100/50 rounded-full mb-4 shadow-2xl',
                    'px-4 py-3',
                    'mx-auto'
                )}
            >
                <div className="grid grid-cols-5 items-center relative">
                    {/* First two items */}
                    <div className="flex justify-center">
                        <MemoizedNavItem
                            item={navItems[0]}
                            isActive={segment === navItems[0].segment}
                        />
                    </div>
                    <div className="flex justify-center">
                        <MemoizedNavItem
                            item={navItems[1]}
                            isActive={segment === navItems[1].segment}
                        />
                    </div>

                    {/* Contextual Action Button */}
                    <div className="flex justify-center">
                        <div className="-mt-12">
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
                    </div>

                    {/* Last two items */}
                    <div className="flex justify-center">
                        <MemoizedNavItem
                            item={navItems[2]}
                            isActive={segment === navItems[2].segment}
                        />
                    </div>
                    <div className="flex justify-center">
                        <MemoizedNavItem
                            item={navItems[3]}
                            isActive={segment === navItems[3].segment}
                        />
                    </div>
                </div>
            </nav>
        </div>
    );
}
