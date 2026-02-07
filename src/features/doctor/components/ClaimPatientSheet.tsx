'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';

interface ClaimPatientSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (proId: string) => void;
    professionals: User[];
    patientName: string;
}

export function ClaimPatientSheet({
    isOpen,
    onClose,
    onSelect,
    professionals,
    patientName,
}: ClaimPatientSheetProps) {
    const [selectedProId, setSelectedProId] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 ios-shadow animate-in slide-in-from-bottom duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Vincular Paciente</h2>
                    <p className="text-secondary text-sm">
                        Selecciona el profesional para <span className="font-bold text-slate-800">{patientName}</span>
                    </p>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {professionals.length > 0 ? (
                        professionals.map((pro) => (
                            <button
                                key={pro.id}
                                onClick={() => setSelectedProId(pro.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-3xl transition-all border-2",
                                    selectedProId === pro.id
                                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                        : "border-slate-50 bg-slate-50/50 hover:bg-slate-50"
                                )}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                                    {pro.avatarUrl ? (
                                        <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-400">person</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800 text-sm">{pro.name}</p>
                                    <p className="text-xs text-secondary">{pro.specialization || 'Profesional'}</p>
                                </div>
                                {selectedProId === pro.id && (
                                    <span className="material-symbols-outlined ml-auto text-primary">check_circle</span>
                                )}
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-secondary py-8 text-sm italic">Cargando profesionales...</p>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-secondary hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!selectedProId}
                        onClick={() => selectedProId && onSelect(selectedProId)}
                        className="flex-2 py-4 px-8 rounded-2xl bg-neutral-900 text-white font-bold disabled:opacity-30 active:scale-95 transition-all shadow-lg"
                    >
                        Asignar Ahora
                    </button>
                </div>
            </div>
        </div>
    );
}
