'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { calculateDailyAdherence, getTodayString } from '@/lib/adherence';
import { ProductDetailSheet } from '@/features/patient/components/ProductDetailSheet';
import type { ScheduleType, RoutineProduct } from '@/lib/types';

export default function RoutinePage() {
    const [hasMounted, setHasMounted] = useState(false);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [activeTime, setActiveTime] = useState<ScheduleType>('am');
    const [selectedProduct, setSelectedProduct] = useState<RoutineProduct | null>(null);

    // Hydration fix: wait for client mount
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const { getPatientRoutine, adherenceLogs, toggleProductCheck, getProductStatus } = useDermoCareStore();
    const routine = hasMounted ? getPatientRoutine(activeTime) : undefined;
    const todayString = getTodayString();

    // Generate week days
    const weekDays = useMemo(() => {
        const days = [];
        const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        for (let i = -2; i <= 2; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                dayName: dayNames[date.getDay()],
                date: date.getDate(),
                fullDate: date,
            });
        }
        return days;
    }, []);

    // Calculate progress
    const progress = useMemo(() => {
        if (!hasMounted || !routine) return { completed: 0, total: 0, percentage: 0 };
        return calculateDailyAdherence(
            adherenceLogs,
            routine,
            todayString,
            activeTime
        );
    }, [hasMounted, routine, adherenceLogs, activeTime, todayString]);

    const handleProductClick = (product: RoutineProduct) => {
        setSelectedProduct(product);
    };

    const handleCheckToggle = (e: React.MouseEvent, product: RoutineProduct) => {
        e.stopPropagation();
        if (!routine) return;
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        toggleProductCheck(routine.id, product.id, activeTime, todayString);
    };

    // Icon colors based on product category
    const iconColors: Record<string, string> = {
        cleanser: 'text-blue-400',
        serum: 'text-orange-400',
        moisturizer: 'text-pink-400',
        sunscreen: 'text-yellow-500',
        treatment: 'text-purple-400',
        other: 'text-gray-400',
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex items-center justify-between">
                <button className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-neutral-600">
                        chevron_left
                    </span>
                </button>
                <h1 className="text-xl font-black text-neutral-900">Rutina Diaria</h1>
                <button className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-neutral-600">
                        more_horiz
                    </span>
                </button>
            </header>

            {/* Week Calendar */}
            <div className="flex justify-between px-6 py-6 border-b border-neutral-50">
                {weekDays.map((item) => (
                    <button
                        key={item.date}
                        onClick={() => setSelectedDate(item.date)}
                        className={cn(
                            'flex flex-col items-center gap-2 transition-all',
                            selectedDate === item.date ? 'scale-110' : 'opacity-50'
                        )}
                    >
                        <span className="text-[10px] font-black tracking-widest text-secondary">
                            {item.dayName}
                        </span>
                        <div
                            className={cn(
                                'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg',
                                selectedDate === item.date
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-neutral-800'
                            )}
                        >
                            {item.date}
                        </div>
                    </button>
                ))}
            </div>

            <main className="px-6 py-8 pb-32">
                {/* Progress Summary Card */}
                <div className="bg-primary rounded-[2.5rem] p-8 mb-8 relative overflow-hidden flex items-center gap-6">
                    <div className="flex-1 relative z-10 text-white">
                        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                            Progreso de Hoy
                        </p>
                        <h2 className="text-2xl font-black mb-4">
                            {progress.completed} de {progress.total} completados
                        </h2>
                        <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center relative z-10">
                        <span className="material-symbols-outlined text-3xl text-white">
                            spa
                        </span>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                </div>

                {/* Time Selector Pills */}
                <div className="flex bg-neutral-50 p-1.5 rounded-2xl mb-8">
                    <button
                        onClick={() => setActiveTime('am')}
                        className={cn(
                            'flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2',
                            activeTime === 'am'
                                ? 'bg-white shadow-md text-neutral-900'
                                : 'text-secondary'
                        )}
                    >
                        <span className="material-symbols-outlined text-sm">wb_sunny</span>
                        Mañana
                    </button>
                    <button
                        onClick={() => setActiveTime('pm')}
                        className={cn(
                            'flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2',
                            activeTime === 'pm'
                                ? 'bg-white shadow-md text-neutral-900'
                                : 'text-secondary'
                        )}
                    >
                        <span className="material-symbols-outlined text-sm">
                            nightlight_round
                        </span>
                        Noche
                    </button>
                </div>

                {/* Routine List - Now clickable for details */}
                <div className="space-y-4">
                    {routine?.products.map((product) => {
                        const status = hasMounted
                            ? getProductStatus(routine.id, product.id, activeTime, todayString)
                            : 'pending';
                        const isChecked = status === 'checked';

                        return (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className={cn(
                                    'bg-white p-5 rounded-[28px] flex items-center gap-4 shadow-sm border border-gray-50',
                                    'cursor-pointer transition-all duration-200',
                                    'active:scale-[0.98]',
                                    isChecked && 'bg-gray-50/80'
                                )}
                            >
                                {/* Product Icon */}
                                <div
                                    className={cn(
                                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                                        product.iconBgColor || 'bg-gray-100'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'material-symbols-outlined text-2xl',
                                            iconColors[product.category] || 'text-gray-400'
                                        )}
                                    >
                                        {product.iconName || 'spa'}
                                    </span>
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className={cn(
                                            'font-bold text-gray-800 transition-colors',
                                            isChecked && 'text-gray-500'
                                        )}
                                    >
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">info</span>
                                        Toca para ver instrucciones
                                    </p>
                                </div>

                                {/* Checkbox */}
                                <div
                                    onClick={(e) => handleCheckToggle(e, product)}
                                    className="flex items-center p-2 -m-2"
                                >
                                    <div
                                        className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                                            isChecked
                                                ? 'bg-green-500 scale-100'
                                                : 'border-2 border-gray-200 scale-100 hover:border-primary'
                                        )}
                                    >
                                        {isChecked && (
                                            <span className="material-symbols-outlined text-lg font-bold text-white">
                                                check
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {!routine && (
                        <div className="text-center py-12 text-secondary">
                            <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
                                spa
                            </span>
                            <p className="font-medium">
                                No hay rutina asignada para este horario
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Product Detail Sheet */}
            {selectedProduct && (
                <ProductDetailSheet
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
