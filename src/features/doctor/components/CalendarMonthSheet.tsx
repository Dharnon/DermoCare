'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { formatDate } from '@/lib/adherence';
import { Drawer } from '@/components/shared/Drawer';

interface CalendarMonthSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate: string;
    onDateSelect: (date: string) => void;
}

export function CalendarMonthSheet({ isOpen, onClose, currentDate, onDateSelect }: CalendarMonthSheetProps) {
    const [viewDate, setViewDate] = useState(new Date(currentDate || new Date()));
    const { currentPro, getDoctorAppointments } = useDermoCareStore();

    // Reset view date when opened
    useEffect(() => {
        if (isOpen) {
            setViewDate(new Date(currentDate || new Date()));
        }
    }, [isOpen, currentDate]);

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty days for padding at start
        // getDay() returns 0 for Sunday. We want Monday to be 0 for layout if we start week on Monday.
        // Standard calendar often starts on Sunday (0). Let's stick to standard Sunday start or adjust.
        // Let's use standard Sunday start for simplicity, or Monday if preferred.
        // Spanish calendars usually start Monday.
        let startPadding = firstDay.getDay() - 1;
        if (startPadding === -1) startPadding = 6; // Sunday becomes 6

        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateString = formatDate(date);

            // Check appointments
            const hasAppointments = currentPro
                ? getDoctorAppointments(currentPro.id, dateString).some(a => a.status !== 'cancelled')
                : false;

            days.push({
                date: date,
                dateString: dateString,
                dayNumber: i,
                hasAppointments,
                isToday: formatDate(new Date()) === dateString,
                isSelected: currentDate === dateString
            });
        }

        return days;
    }, [viewDate, currentPro, getDoctorAppointments, currentDate]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelect = (dateString: string) => {
        onDateSelect(dateString);
        onClose();
    };

    if (!isOpen) return null;

    const monthLabel = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            className="max-h-[85vh] min-h-[50vh]"
        >
            <div className="pb-12 pt-4">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handlePrevMonth}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100"
                    >
                        <span className="material-symbols-outlined text-gray-600">chevron_left</span>
                    </button>

                    <h2 className="text-lg font-bold capitalize text-slate-800">
                        {monthLabel}
                    </h2>

                    <button
                        onClick={handleNextMonth}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100"
                    >
                        <span className="material-symbols-outlined text-gray-600">chevron_right</span>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="mb-2">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-4">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                        {daysInMonth.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} />;

                            return (
                                <button
                                    key={day.dateString}
                                    onClick={() => handleSelect(day.dateString)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center w-full aspect-square rounded-xl text-sm font-medium transition-all group",
                                        day.isSelected
                                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                                            : day.isToday
                                                ? "bg-primary/10 text-primary font-bold"
                                                : "hover:bg-gray-50 text-slate-700"
                                    )}
                                >
                                    <span>{day.dayNumber}</span>
                                    {/* Status Dot */}
                                    {day.hasAppointments && (
                                        <span
                                            className={cn(
                                                "absolute bottom-2 w-1 h-1 rounded-full",
                                                day.isSelected ? "bg-white" : "bg-primary"
                                            )}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-xs text-secondary">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span>Con Citas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                            1
                        </span>
                        <span>Hoy</span>
                    </div>
                </div>
            </div>
        </Drawer>
    );
}
