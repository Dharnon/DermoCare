'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { cn } from '@/lib/utils';
import { EditTemplateSheet } from '@/features/doctor/components/EditTemplateSheet';
import type { RoutineTemplate } from '@/lib/types';

export default function TemplatesPage() {
    const { templates } = useDermoCareStore();
    const { setFab, hideFab } = useUIStore();

    // State
    const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Set Global FAB Action
    useEffect(() => {
        setFab(() => {
            setSelectedTemplate(null); // Create mode
            setIsSheetOpen(true);
        }, 'bookmark_add');
        return () => hideFab();
    }, [setFab, hideFab]);

    const handleEdit = (template: RoutineTemplate) => {
        setSelectedTemplate(template);
        setIsSheetOpen(true);
    };

    const handleClose = () => {
        setIsSheetOpen(false);
        // Delay clearing selected template for animation smoothness if needed, 
        // but simple null set is fine for now usually.
        // Actually, if I set null immediately, the sheet content might jump to "New Template" while closing.
        // But since component unmounts or animates... 
        // For standard sheet, usually keeping data until closed is better.
        // For now, simple logic.
        setTimeout(() => setSelectedTemplate(null), 300);
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32">
            <header className="px-6 pt-12 pb-6 flex items-center gap-4">
                <Link href="/doctor/tools" className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-600 active:scale-90 transition-transform shadow-sm">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Plantillas</h1>
                    <p className="text-secondary text-sm">Gestiona tus rutinas predefinidas</p>
                </div>
            </header>

            <div className="px-6">
                {templates.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-neutral-100 shadow-sm">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-neutral-300">bookmark_add</span>
                        </div>
                        <h2 className="font-bold text-neutral-900 mb-1">Sin plantillas</h2>
                        <p className="text-sm text-secondary mb-6">
                            Crea una nueva con el botón inferior o guarda una rutina existente.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleEdit(template)}
                                className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm active:scale-[0.99] transition-all flex items-center gap-4 cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">
                                        {template.icon}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-neutral-900 truncate">{template.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                            template.scheduleType === 'am' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                                        )}>
                                            {template.scheduleType === 'am' ? 'Día' : 'Noche'}
                                        </span>
                                        <span className="text-xs text-secondary">
                                            {template.products.length} productos
                                        </span>
                                    </div>
                                </div>

                                <span className="material-symbols-outlined text-neutral-300">edit</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EditTemplateSheet
                template={selectedTemplate}
                isOpen={isSheetOpen}
                onClose={handleClose}
            />
        </div>
    );
}
