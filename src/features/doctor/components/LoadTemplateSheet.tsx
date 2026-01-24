'use client';

import { useDermoCareStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { RoutineProduct } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface LoadTemplateSheetProps {
    isOpen: boolean;
    onClose: () => void;
    routineId: string;
}

export function LoadTemplateSheet({ isOpen, onClose, routineId }: LoadTemplateSheetProps) {
    const { templates, applyTemplateToRoutine, getProductById, deleteTemplate } = useDermoCareStore();

    const handleApply = (templateId: string) => {
        applyTemplateToRoutine(routineId, templateId);
        onClose();
    };

    const handleDelete = (e: React.MouseEvent, templateId: string) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
            deleteTemplate(templateId);
        }
    };

    if (!isOpen) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Cargar Plantilla"
            description="Selecciona una plantilla para aplicar a esta rutina"
        >
            <div className="pb-12 pt-4">
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-3 opacity-50">content_paste_off</span>
                        <p>No hay plantillas guardadas.</p>
                        <p className="text-xs mt-1">
                            Configura una rutina y guárdala como plantilla para verla aquí.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleApply(template.id)}
                                className="relative flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 transition-all active:scale-[0.99] cursor-pointer group"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-2xl">
                                        {template.icon}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-neutral-800">{template.name}</h3>
                                    <p className="text-xs text-secondary mt-0.5">
                                        {template.products.length} productos • {template.scheduleType === 'am' ? 'Mañana' : 'Noche'}
                                    </p>
                                </div>

                                {/* Apply Action Icon */}
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-green-500 font-bold">check</span>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDelete(e, template.id)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/50 hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3.5 rounded-xl font-bold border border-neutral-200 text-neutral-600"
                >
                    Cancelar
                </button>
            </div>
        </Drawer>
    );
}
