'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import type { RoutineTemplate } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer'; // Added

interface EditTemplateSheetProps {
    template: RoutineTemplate | null;
    isOpen: boolean;
    onClose: () => void;
}

const ICONS = [
    { name: 'spa', label: 'Rutina General' },
    { name: 'clean_hands', label: 'Limpieza' },
    { name: 'face_retouching_natural', label: 'Anti-edad' },
    { name: 'water_drop', label: 'Hidratación' },
    { name: 'wb_sunny', label: 'Día' },
    { name: 'bedtime', label: 'Noche' },
    { name: 'healing', label: 'Reparación' },
    { name: 'sanitizer', label: 'Acné' },
];

export function EditTemplateSheet({ template, isOpen, onClose }: EditTemplateSheetProps) {
    const { deleteTemplate, updateTemplate, addTemplate } = useDermoCareStore();
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('spa');
    const [scheduleType, setScheduleType] = useState<'am' | 'pm'>('am');

    useEffect(() => {
        if (isOpen) {
            if (template) {
                setName(template.name);
                setSelectedIcon(template.icon);
                setScheduleType(template.scheduleType);
            } else {
                setName('');
                setSelectedIcon('spa');
                setScheduleType('am');
            }
        }
    }, [template, isOpen]);

    const handleDelete = () => {
        if (template && confirm('¿Eliminar esta plantilla?')) {
            deleteTemplate(template.id);
            onClose();
        }
    };

    const handleSave = () => {
        if (!name.trim()) return;

        if (template) {
            updateTemplate(template.id, { name, icon: selectedIcon });
        } else {
            addTemplate({
                name,
                icon: selectedIcon,
                scheduleType,
                products: [] // Start empty
            });
        }
        onClose();
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={template ? 'Editar Plantilla' : 'Nueva Plantilla'}
            description={template ? 'Modificar nombre e icono' : 'Crear plantilla desde cero'}
        >
            <div className="pb-12">
                <div className="mb-6 flex justify-end">
                    {/* Schedule Toggle */}
                    {template ? (
                        <div className="bg-neutral-100 px-3 py-1 rounded-full text-xs font-bold text-neutral-500 uppercase tracking-wide">
                            {template.scheduleType === 'am' ? 'Mañana' : 'Noche'}
                        </div>
                    ) : (
                        <div className="flex bg-neutral-100 p-1 rounded-full">
                            <button
                                onClick={() => setScheduleType('am')}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all",
                                    scheduleType === 'am' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-400"
                                )}
                            >
                                AM
                            </button>
                            <button
                                onClick={() => setScheduleType('pm')}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all",
                                    scheduleType === 'pm' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-400"
                                )}
                            >
                                PM
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Rutina Básica de Acné"
                        className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Icono
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {ICONS.map((icon) => (
                            <button
                                key={icon.name}
                                onClick={() => setSelectedIcon(icon.name)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all",
                                    selectedIcon === icon.name
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "bg-neutral-50 border border-neutral-100 text-neutral-500 hover:bg-neutral-100"
                                )}
                            >
                                <span className="material-symbols-outlined text-2xl">
                                    {icon.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Productos
                    </label>
                    <div className="bg-neutral-50 rounded-2xl p-4 text-sm text-neutral-600 space-y-2">
                        <p className="text-xs italic text-neutral-400">
                            {template
                                ? `Contiene ${template.products.length} productos. Para modificarlos, usa el editor de rutinas de un paciente.`
                                : "La plantilla se creará vacía. Podrás añadir productos cargándola en un paciente."
                            }
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {template && (
                        <button
                            onClick={handleDelete}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-red-50 text-red-500 border border-red-100 active:scale-95 transition-transform"
                        >
                            Eliminar
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className={cn(
                            "py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform",
                            template ? "flex-[2]" : "w-full",
                            name.trim()
                                ? "bg-primary shadow-primary/30 active:scale-95"
                                : "bg-neutral-300 shadow-none cursor-not-allowed"
                        )}
                    >
                        {template ? 'Guardar Cambios' : 'Crear Plantilla'}
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
