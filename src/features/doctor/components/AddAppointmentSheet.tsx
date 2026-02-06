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

    // UI State for custom details
    const [isPatientSelectOpen, setIsPatientSelectOpen] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');

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
                    {/* Patient Select (Custom Logic) */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Paciente</label>

                        {/* Trigger Button */}
                        <button
                            onClick={() => setIsPatientSelectOpen(!isPatientSelectOpen)}
                            className={cn(
                                "w-full p-2 pr-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-left flex items-center justify-between transition-all",
                                isPatientSelectOpen ? "ring-2 ring-primary/20 bg-white" : ""
                            )}
                        >
                            {patientId ? (
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const p = patients.find(p => p.id === patientId);
                                        return (
                                            <>
                                                <img
                                                    src={p?.avatarUrl}
                                                    alt={p?.name}
                                                    className="w-10 h-10 rounded-full object-cover bg-neutral-200"
                                                />
                                                <span className="font-bold text-neutral-800">{p?.name}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <span className="p-2 text-neutral-400 font-semibold">Seleccionar paciente...</span>
                            )}
                            <span className="material-symbols-outlined text-neutral-400">expand_more</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isPatientSelectOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-100 z-50 overflow-hidden animation-fade-in">
                                {/* Search Input */}
                                <div className="p-2 border-b border-neutral-100 sticky top-0 bg-white z-10">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-[18px]">search</span>
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            value={patientSearch}
                                            onChange={(e) => setPatientSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Patient List */}
                                <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                    {patients
                                        .filter(p => p.role === 'patient' && p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setPatientId(p.id);
                                                    setIsPatientSelectOpen(false);
                                                    setPatientSearch('');
                                                }}
                                                className={cn(
                                                    "w-full p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left",
                                                    patientId === p.id ? "bg-primary/10 ring-1 ring-primary/20" : ""
                                                )}
                                            >
                                                <img
                                                    src={p.avatarUrl}
                                                    alt={p.name}
                                                    className="w-10 h-10 rounded-full object-cover bg-neutral-200"
                                                />
                                                <div className="flex-1">
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        patientId === p.id ? "text-primary" : "text-neutral-800"
                                                    )}>
                                                        {p.name}
                                                    </p>
                                                    <p className="text-xs text-secondary truncate">{p.contactInfo?.email}</p>
                                                </div>
                                                {patientId === p.id && (
                                                    <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                                                )}
                                            </button>
                                        ))}

                                    {patients.filter(p => p.role === 'patient' && p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                                        <div className="p-4 text-center text-neutral-400 text-sm">
                                            No se encontraron pacientes
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div> (Custom Logic end)

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
