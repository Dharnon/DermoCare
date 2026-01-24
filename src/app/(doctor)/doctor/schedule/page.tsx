"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDermoCareStore } from "@/lib/store";
import { useUIStore } from "@/lib/ui-store"; // Added
import { formatDate } from "@/lib/adherence";
import type { AppointmentStatus } from "@/lib/types";
import { CalendarMonthSheet } from "@/features/doctor/components/CalendarMonthSheet";
import { AddAppointmentSheet } from "@/features/doctor/components/AddAppointmentSheet"; // Added

const statusConfig: Record<AppointmentStatus, { color: string; textColor: string; bgColor: string; label: string }> = {
    pending: { color: "bg-amber-400", textColor: "text-amber-600", bgColor: "bg-amber-50", label: "PENDIENTE" },
    confirmed: { color: "bg-green-400", textColor: "text-green-600", bgColor: "bg-green-50", label: "CONFIRMADA" },
    arrived: { color: "bg-blue-400", textColor: "text-blue-600", bgColor: "bg-blue-50", label: "EN CONSULTA" },
    completed: { color: "bg-neutral-400", textColor: "text-neutral-600", bgColor: "bg-neutral-100", label: "COMPLETADA" },
    cancelled: { color: "bg-red-400", textColor: "text-red-500", bgColor: "bg-red-50", label: "CANCELADA" },
};

const visitTypeLabels: Record<string, string> = {
    'first-visit': 'Primera Visita',
    'follow-up': 'Seguimiento',
    'routine-check': 'Revisión de Rutina',
};

export default function SchedulePage() {
    const [hasMounted, setHasMounted] = useState(false);
    const { setFab, hideFab } = useUIStore(); // Added

    // Hydration fix
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const {
        currentPro,
        getDoctorAppointments,
        getPatientById,
        updateAppointmentStatus,
        cancelAppointment,
    } = useDermoCareStore();

    // Generate week days starting from today
    const days = useMemo(() => {
        if (!hasMounted || !currentPro) return [];
        const result: { date: string; dayName: string; dayNumber: number; hasAppointments: boolean }[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = formatDate(date);
            const dayApts = getDoctorAppointments(currentPro.id, dateString)
                .filter(apt => apt.status !== 'cancelled');

            result.push({
                date: dateString,
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().slice(0, 3),
                dayNumber: date.getDate(),
                hasAppointments: dayApts.length > 0
            });
        }
        return result;
    }, [hasMounted, currentPro, getDoctorAppointments]);

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false); // Added

    // Set Global FAB Action
    useEffect(() => {
        setFab(() => setIsAddAppointmentOpen(true), 'event_available');
        return () => hideFab();
    }, [setFab, hideFab]);

    // Initialize selectedDate once days are available
    useEffect(() => {
        if (days.length > 0 && !selectedDate) {
            setSelectedDate(days[0].date);
        }
    }, [days, selectedDate]);

    // Get appointments for selected day
    const appointments = useMemo(() => {
        if (!hasMounted || !currentPro || !selectedDate) return [];
        return getDoctorAppointments(currentPro.id, selectedDate)
            .filter(apt => apt.status !== 'cancelled')
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [hasMounted, currentPro, selectedDate, getDoctorAppointments]);

    // Get current date display
    const selectedDateDisplay = useMemo(() => {
        if (!selectedDate) return '';
        const date = new Date(selectedDate);
        return date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
    }, [selectedDate]);

    const handleConfirm = (appointmentId: string) => {
        if (navigator.vibrate) navigator.vibrate(50);
        updateAppointmentStatus(appointmentId, 'confirmed');
    };

    const handleArrived = (appointmentId: string) => {
        if (navigator.vibrate) navigator.vibrate(50);
        updateAppointmentStatus(appointmentId, 'arrived');
    };

    const handleComplete = (appointmentId: string) => {
        if (navigator.vibrate) navigator.vibrate(50);
        updateAppointmentStatus(appointmentId, 'completed');
    };

    const handleCancel = (appointmentId: string) => {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        cancelAppointment(appointmentId);
    };

    return (
        <div className="min-h-screen pb-32">
            <CalendarMonthSheet
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                currentDate={selectedDate || formatDate(new Date())}
                onDateSelect={setSelectedDate}
            />

            <AddAppointmentSheet
                isOpen={isAddAppointmentOpen}
                onClose={() => setIsAddAppointmentOpen(false)}
                defaultDate={selectedDate}
            />

            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Agenda</h1>
                    <p className="text-secondary text-sm font-medium capitalize">{selectedDateDisplay}</p>
                </div>
                <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center ios-shadow border border-neutral-100 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-neutral-600">calendar_month</span>
                </button>
            </header>

            {/* Week Day Selector */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-6 mb-8">
                {days.map((day) => (
                    <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={cn(
                            "relative flex flex-col items-center justify-center min-w-[60px] h-20 rounded-2xl transition-all",
                            selectedDate === day.date
                                ? "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2"
                                : "bg-white ios-shadow border border-neutral-50"
                        )}
                    >
                        <span className={cn("text-xs font-semibold", selectedDate === day.date ? "opacity-80" : "text-secondary")}>
                            {day.dayName}
                        </span>
                        <span className="text-lg font-bold">{day.dayNumber}</span>

                        {/* Dot Indicator */}
                        {day.hasAppointments && (
                            <span className={cn(
                                "absolute bottom-2 w-1.5 h-1.5 rounded-full",
                                selectedDate === day.date ? "bg-white" : "bg-primary"
                            )} />
                        )}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative px-6">
                {appointments.length > 0 && (
                    <div className="absolute left-[38px] top-0 bottom-0 w-0.5 bg-neutral-100" />
                )}

                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-neutral-300">event_available</span>
                        </div>
                        <h3 className="font-bold text-neutral-600 mb-1">Sin citas programadas</h3>
                        <p className="text-sm text-neutral-400">No hay citas para este día</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {appointments.map((apt) => {
                            const config = statusConfig[apt.status];
                            const patient = getPatientById(apt.patientId);
                            const isActive = apt.status === 'arrived';

                            return (
                                <div key={apt.id} className="relative pl-12">
                                    {/* Timeline Dot */}
                                    <div
                                        className={cn(
                                            "absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white z-10",
                                            config.color,
                                            isActive && "animate-pulse"
                                        )}
                                    />

                                    {/* Time Header */}
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className={cn("text-sm font-bold", isActive ? "text-primary" : "text-neutral-400")}>
                                            {apt.time}
                                        </span>
                                        <div className={cn("h-px flex-1", isActive ? "bg-primary/20" : "bg-neutral-100")} />
                                    </div>

                                    {/* Appointment Card */}
                                    <div
                                        className={cn(
                                            "p-4 rounded-[2rem] ios-shadow border",
                                            isActive
                                                ? "bg-primary/5 border-primary/30"
                                                : apt.status === 'completed'
                                                    ? "bg-neutral-50 border-neutral-100 opacity-60"
                                                    : "bg-white border-neutral-50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center">
                                                    {patient?.avatarUrl ? (
                                                        <img
                                                            alt={patient.name}
                                                            className="w-full h-full object-cover"
                                                            src={patient.avatarUrl}
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-primary">person</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm">{patient?.name || 'Paciente'}</h3>
                                                    <p className="text-[11px] text-secondary font-medium">
                                                        {visitTypeLabels[apt.visitType] || apt.visitType}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", config.bgColor, config.textColor)}>
                                                {config.label}
                                            </span>
                                        </div>

                                        {/* Reason if exists */}
                                        {apt.reason && (
                                            <p className="text-xs text-neutral-500 mb-3 bg-neutral-50 p-2 rounded-xl">
                                                <span className="font-semibold">Motivo:</span> {apt.reason}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {apt.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirm(apt.id)}
                                                        className="flex-1 py-2 rounded-xl bg-green-500 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                                    >
                                                        <span className="material-symbols-outlined text-base">check</span>
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(apt.id)}
                                                        className="py-2 px-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold flex items-center justify-center active:scale-95 transition-transform"
                                                    >
                                                        <span className="material-symbols-outlined text-base">close</span>
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'confirmed' && (
                                                <>
                                                    <button
                                                        onClick={() => handleArrived(apt.id)}
                                                        className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                                    >
                                                        <span className="material-symbols-outlined text-base">person_check</span>
                                                        Ha llegado
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(apt.id)}
                                                        className="py-2 px-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold flex items-center justify-center active:scale-95 transition-transform"
                                                    >
                                                        <span className="material-symbols-outlined text-base">close</span>
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'arrived' && (
                                                <button
                                                    onClick={() => handleComplete(apt.id)}
                                                    className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                                >
                                                    <span className="material-symbols-outlined text-base">task_alt</span>
                                                    Finalizar Consulta
                                                </button>
                                            )}
                                            {apt.status === 'completed' && (
                                                <span className="flex-1 py-2 text-center text-xs text-neutral-400 font-medium">
                                                    Consulta completada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
