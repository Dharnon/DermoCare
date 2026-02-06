'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';

export default function ToolsPage() {
    const { templates, products } = useDermoCareStore();

    const tools = [
        {
            title: 'Plantillas de Rutina',
            description: 'Gestiona tus kits predefinidos',
            icon: 'bookmark',
            color: 'bg-purple-50 text-purple-600',
            href: '/doctor/tools/templates',
            count: templates.length
        },
        {
            title: 'Inventario',
            description: 'Catálogo de productos',
            icon: 'inventory_2',
            color: 'bg-blue-50 text-blue-600',
            href: '/doctor/tools/inventory',
            count: products.length
        },
        {
            title: 'Configuración',
            description: 'Preferencias de la app',
            icon: 'settings',
            color: 'bg-neutral-50 text-neutral-600',
            href: '/doctor/settings', // Updated to settings page
            count: null
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Herramientas</h1>
                <p className="text-secondary text-sm mt-1">Gestión y configuración</p>
            </header>

            <div className="px-6 grid gap-4">
                {tools.map((tool) => (
                    <Link
                        key={tool.title}
                        href={tool.href}
                        className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4"
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                            tool.color
                        )}>
                            <span className="material-symbols-outlined text-2xl">
                                {tool.icon}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-neutral-900">{tool.title}</h2>
                            <p className="text-sm text-secondary">{tool.description}</p>
                        </div>

                        {tool.count !== null && (
                            <div className="bg-neutral-50 px-3 py-1 rounded-full text-xs font-bold text-neutral-600 border border-neutral-100">
                                {tool.count}
                            </div>
                        )}

                        <span className="material-symbols-outlined text-neutral-300">chevron_right</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
