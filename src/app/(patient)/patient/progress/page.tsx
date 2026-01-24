'use client';

import { useMemo } from 'react';
import { useDermoCareStore } from '@/lib/store';
import { calculateWeeklyAdherence, getAdherenceRiskLevel, getTodayString } from '@/lib/adherence';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
    const {
        currentPatient,
        getPatientRoutine,
        adherenceLogs,
    } = useDermoCareStore();

    const amRoutine = getPatientRoutine('am');
    const pmRoutine = getPatientRoutine('pm');

    // Calculate weekly adherence
    const weeklyAdherence = useMemo(() => {
        if (!amRoutine) return 0;
        return calculateWeeklyAdherence(adherenceLogs, amRoutine);
    }, [amRoutine, adherenceLogs]);

    const riskLevel = getAdherenceRiskLevel(weeklyAdherence);

    // Get recent logs for history
    const recentLogs = useMemo(() => {
        const today = new Date();
        const logs: { date: string; percentage: number }[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayLogs = adherenceLogs.filter(log => log.date === dateStr && log.status === 'checked');
            const totalProducts = (amRoutine?.products.length || 0) + (pmRoutine?.products.length || 0);
            const percentage = totalProducts > 0 ? Math.round((dayLogs.length / totalProducts) * 100) : 0;

            logs.push({
                date: dateStr,
                percentage: Math.min(percentage, 100),
            });
        }

        return logs;
    }, [adherenceLogs, amRoutine, pmRoutine]);

    // Calculate treatment day
    const treatmentDay = useMemo(() => {
        if (!amRoutine?.createdAt) return 1;
        const startDate = new Date(amRoutine.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [amRoutine]);

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="px-6 pb-24">
            <header className="mt-12 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
                        Mi Progreso
                    </h1>
                    <p className="text-secondary font-medium">
                        Día {treatmentDay} de tratamiento
                    </p>
                </div>
                <button className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                </button>
            </header>

            {/* Main Progress Card */}
            <div className="bg-white rounded-[2.5rem] p-6 ios-shadow border border-gray-50 mb-8">
                <div className="flex items-center gap-6">
                    <CircularProgress
                        value={weeklyAdherence}
                        size={100}
                        strokeWidth={10}
                        showLabel
                        progressColor="stroke-primary"
                        trackColor="stroke-primary/20"
                        labelColor="text-primary"
                    />
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                            Adherencia Semanal
                        </p>
                        <h2 className="text-2xl font-black text-slate-900">
                            {weeklyAdherence}%
                        </h2>
                        <span
                            className={cn(
                                'inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase mt-2',
                                riskLevel === 'on-track' && 'bg-green-100 text-green-600',
                                riskLevel === 'at-risk' && 'bg-yellow-100 text-yellow-600',
                                riskLevel === 'critical' && 'bg-red-100 text-red-600'
                            )}
                        >
                            {riskLevel === 'on-track' && '🌟 Excelente'}
                            {riskLevel === 'at-risk' && '⚠️ Mejorable'}
                            {riskLevel === 'critical' && '🚨 Necesita atención'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Weekly Chart */}
            <section className="mb-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 px-1">
                    Últimos 7 Días
                </h3>
                <div className="bg-white rounded-[2rem] p-5 ios-shadow border border-gray-50">
                    <div className="flex justify-between items-end h-32 gap-2">
                        {recentLogs.slice().reverse().map((log, index) => {
                            const date = new Date(log.date);
                            const dayName = dayNames[date.getDay()];
                            const isToday = index === recentLogs.length - 1;

                            return (
                                <div
                                    key={log.date}
                                    className="flex-1 flex flex-col items-center gap-2"
                                >
                                    <div
                                        className={cn(
                                            'w-full rounded-t-lg transition-all',
                                            isToday ? 'bg-primary' : 'bg-primary/30',
                                            log.percentage === 0 && 'bg-gray-100'
                                        )}
                                        style={{
                                            height: `${Math.max(log.percentage, 5)}%`,
                                        }}
                                    />
                                    <span
                                        className={cn(
                                            'text-[10px] font-bold',
                                            isToday ? 'text-primary' : 'text-secondary'
                                        )}
                                    >
                                        {dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-[2rem] ios-shadow border border-gray-50">
                    <span className="material-symbols-outlined text-2xl text-primary mb-2">
                        calendar_today
                    </span>
                    <p className="text-2xl font-black text-slate-900">{treatmentDay}</p>
                    <p className="text-xs text-secondary font-medium">Días en tratamiento</p>
                </div>
                <div className="bg-white p-5 rounded-[2rem] ios-shadow border border-gray-50">
                    <span className="material-symbols-outlined text-2xl text-green-500 mb-2">
                        check_circle
                    </span>
                    <p className="text-2xl font-black text-slate-900">
                        {adherenceLogs.filter(l => l.status === 'checked').length}
                    </p>
                    <p className="text-xs text-secondary font-medium">Productos aplicados</p>
                </div>
            </section>

            {/* Tips */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 px-1">
                    Consejos
                </h3>
                <div className="bg-primary/10 p-5 rounded-[2rem]">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">lightbulb</span>
                        <div>
                            <p className="font-bold text-slate-800 mb-1">Mantén la consistencia</p>
                            <p className="text-sm text-slate-600">
                                Aplicar los productos a la misma hora cada día ayuda a crear
                                un hábito y mejora los resultados.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
