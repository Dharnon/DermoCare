'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { Drawer } from '@/components/shared/Drawer';

interface SaveTemplateSheetProps {
    isOpen: boolean;
    onClose: () => void;
    routineId: string;
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

export function SaveTemplateSheet({ isOpen, onClose, routineId }: SaveTemplateSheetProps) {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('spa');
    const { saveRoutineAsTemplate } = useDermoCareStore();

    const handleSave = () => {
        if (name.trim()) {
            saveRoutineAsTemplate(routineId, name, selectedIcon);
            setName('');
            setSelectedIcon('spa');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Guardar como Plantilla"
            description="Crea una plantilla para reutilizar esta rutina"
        >
            <div className="pb-12 pt-4">
                <div className="mb-6">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                        Nombre de la Plantilla
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Rutina Acné Severo"
                        className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                        autoFocus
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

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl font-bold border border-neutral-200 text-neutral-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className={cn(
                            "flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all",
                            name.trim()
                                ? "bg-primary shadow-primary/30"
                                : "bg-neutral-300 shadow-none cursor-not-allowed"
                        )}
                    >
                        Guardar Plantilla
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
