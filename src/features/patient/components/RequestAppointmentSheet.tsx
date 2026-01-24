'use client';

import { useState, useMemo } from 'react';
import { useDermoCareStore } from '@/lib/store';
import { formatDate } from '@/lib/adherence';
import type { VisitType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Drawer } from '@/components/shared/Drawer';

interface RequestAppointmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentCreated?: () => void;
}

const visitTypes: { value: VisitType; label: string; icon: string }[] = [
    { value: 'first-visit', label: 'Primera Visita', icon: 'person_add' },
    { value: 'follow-up', label: 'Seguimiento', icon: 'follow_the_signs' },
    { value: 'routine-check', label: 'Revisión de Rutina', icon: 'checklist' },
];

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '16:00', '16:30', '17:00', '17:30',
];

export function RequestAppointmentSheet({ isOpen, onClose, onAppointmentCreated }: RequestAppointmentSheetProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentPatient, currentPro, addAppointment, getDoctorAppointments } = useDermoCareStore();

    // Generate next 14 days for date selection
    const availableDates = useMemo(() => {
        const dates: { date: string; dayName: string; dayNumber: number; monthName: string }[] = [];
        const today = new Date();

        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Skip Sundays
            if (date.getDay() === 0) continue;

            dates.push({
                date: formatDate(date),
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
                dayNumber: date.getDate(),
                monthName: date.toLocaleDateString('es-ES', { month: 'short' }),
            });
        }

        return dates;
    }, []);

    // Get booked slots for selected date
    const bookedSlots = useMemo(() => {
        if (!selectedDate || !currentPro) return [];

        return getDoctorAppointments(currentPro.id, selectedDate)
            .filter(apt => apt.status !== 'cancelled')
            .map(apt => apt.time);
    }, [selectedDate, currentPro, getDoctorAppointments]);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedVisitType || !currentPatient || !currentPro) {
            return;
        }

        setIsSubmitting(true);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        addAppointment({
            patientId: currentPatient.id,
            proId: currentPro.id,
            date: selectedDate,
            time: selectedTime,
            status: 'pending',
            visitType: selectedVisitType,
            reason: reason || undefined,
        });

        // Reset form
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedVisitType(null);
        setReason('');
        setIsSubmitting(false);
        onClose();

        onAppointmentCreated?.();
    };

    const canSubmit = selectedDate && selectedTime && selectedVisitType;

    if (!isOpen) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Solicitar Cita"
            description="Selecciona fecha y hora para tu próxima consulta"
            className="max-h-[90vh] min-h-[60vh]"
        >
            <div className="pb-12">
                {/* Date Selection */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Fecha
                    </h3>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
                        {availableDates.map((d) => (
                            <button
                                key={d.date}
                                onClick={() => {
                                    setSelectedDate(d.date);
                                    setSelectedTime(null); // Reset time when date changes
                                }}
                                className={cn(
                                    'flex flex-col items-center min-w-[60px] py-3 px-2 rounded-2xl transition-all',
                                    selectedDate === d.date
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-neutral-50 border border-neutral-100'
                                )}
                            >
                                <span className={cn('text-[10px] font-semibold', selectedDate === d.date ? 'opacity-80' : 'text-secondary')}>
                                    {d.dayName}
                                </span>
                                <span className="text-lg font-bold">{d.dayNumber}</span>
                                <span className={cn('text-[10px]', selectedDate === d.date ? 'opacity-80' : 'text-secondary')}>
                                    {d.monthName}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Selection */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Hora
                    </h3>
                    {selectedDate ? (
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((time) => {
                                const isBooked = bookedSlots.includes(time);
                                return (
                                    <button
                                        key={time}
                                        disabled={isBooked}
                                        onClick={() => setSelectedTime(time)}
                                        className={cn(
                                            'py-3 rounded-xl font-semibold text-sm transition-all',
                                            isBooked
                                                ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                                                : selectedTime === time
                                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                    : 'bg-neutral-50 border border-neutral-100 text-neutral-700'
                                        )}
                                    >
                                        <span className={isBooked ? 'line-through' : ''}>{time}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 bg-neutral-50 rounded-2xl text-center text-sm text-secondary">
                            Selecciona una fecha primero
                        </div>
                    )}
                </div>

                {/* Visit Type */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Tipo de Visita
                    </h3>
                    <div className="space-y-2">
                        {visitTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedVisitType(type.value)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-4 rounded-2xl transition-all',
                                    selectedVisitType === type.value
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-neutral-50 border border-neutral-100'
                                )}
                            >
                                <div className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center',
                                    selectedVisitType === type.value ? 'bg-primary text-white' : 'bg-white text-neutral-600'
                                )}>
                                    <span className="material-symbols-outlined text-xl">{type.icon}</span>
                                </div>
                                <span className={cn(
                                    'font-semibold',
                                    selectedVisitType === type.value ? 'text-primary' : 'text-neutral-700'
                                )}>
                                    {type.label}
                                </span>
                                {selectedVisitType === type.value && (
                                    <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reason (optional) */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Motivo <span className="text-neutral-400 font-normal">(opcional)</span>
                    </h3>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Describe brevemente el motivo de tu consulta..."
                        className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className={cn(
                        'w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2',
                        canSubmit
                            ? 'bg-primary shadow-lg shadow-primary/30 active:scale-[0.98]'
                            : 'bg-neutral-300 cursor-not-allowed'
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                            Solicitar Cita
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-secondary mt-4">
                    Recibirás confirmación cuando tu doctor acepte la cita
                </p>
            </div>
        </Drawer>
    );
}
