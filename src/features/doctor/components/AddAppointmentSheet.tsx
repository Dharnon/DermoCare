'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { formatDate } from '@/lib/adherence';
import type { VisitType } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface AddAppointmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDate?: string;
}

const VISIT_TYPES: { value: VisitType; label: string }[] = [
    { value: 'first-visit', label: 'Primera Visita' },
    { value: 'follow-up', label: 'Seguimiento' },
    { value: 'routine-check', label: 'Revisión de Rutina' },
];

export function AddAppointmentSheet({ isOpen, onClose, defaultDate }: AddAppointmentSheetProps) {
    const { patients, addAppointment, currentPro } = useDermoCareStore();

    // Form State
    const [patientId, setPatientId] = useState('');
    const [date, setDate] = useState(defaultDate || formatDate(new Date()));
    const [time, setTime] = useState('09:00');
    const [visitType, setVisitType] = useState<VisitType>('follow-up');
    const [reason, setReason] = useState('');

    const handleSave = () => {
        if (!patientId || !date || !time) return;

        addAppointment({
            patientId,
            proId: currentPro?.id || 'pro-1',
            date,
            time,
            status: 'confirmed', // Auto-confirm for doctor created
            visitType,
            reason,
            notes: ''
        });

        // Reset and close
        setPatientId('');
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Cita"
            description="Programar una visita"
        >
            <div className="pb-12 pt-4">
                <div className="space-y-6">
                    {/* Patient Select */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Paciente</label>
                        <select
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                        >
                            <option value="">Seleccionar paciente...</option>
                            {patients.filter(p => p.role === 'patient').map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Hora</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Visit Type */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Tipo de Visita</label>
                        <div className="flex flex-wrap gap-2">
                            {VISIT_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setVisitType(type.value)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                                        visitType === type.value
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-white text-neutral-500 border-neutral-200"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Motivo</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Motivo de la consulta..."
                            className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!patientId || !date || !time}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all mt-4",
                            (!patientId || !date || !time)
                                ? "bg-neutral-300 shadow-none cursor-not-allowed"
                                : "bg-primary shadow-primary/30 active:scale-[0.98]"
                        )}
                    >
                        Agendar Cita
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
