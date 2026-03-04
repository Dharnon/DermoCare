'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDermoCareStore } from '@/lib/store';
import { calculateDailyAdherence, getTodayString } from '@/lib/adherence';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { RequestAppointmentSheet } from '@/features/patient/components/RequestAppointmentSheet';
import { NotificationSheet } from '@/features/patient/components/NotificationSheet';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

const visitTypeLabels: Record<string, string> = {
    'first-visit': 'Primera Visita',
    'follow-up': 'Seguimiento',
    'routine-check': 'Revisión',
};

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'text-amber-600 bg-amber-50' },
    confirmed: { label: 'Confirmada', color: 'text-green-600 bg-green-50' },
};

export default function PatientDashboard() {
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();
    const { profile } = useAuth();

    // Hydration fix - eslint-disable for common SSR pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const {
        currentPatient,
        getPatientRoutine,
        adherenceLogs,
        currentPro,
        getNextPatientAppointment,
        fetchPatientData,
        isLoading,
        error
    } = useDermoCareStore();

    // Sync Auth Data & Fetch Real Data
    useEffect(() => {
        if (profile) {
            const storeUser: User = {
                id: profile.id,
                name: profile.name || 'Usuario',
                role: (profile.role as 'patient' | 'pro') || 'patient',
                avatarUrl: profile.avatar_url || undefined,
                contactInfo: { email: profile.email || '' }
            };
            fetchPatientData(profile.id);
        }
    }, [profile, fetchPatientData]);

    const [showAppointmentSheet, setShowAppointmentSheet] = useState(false);
    const [showNotificationSheet, setShowNotificationSheet] = useState(false);
    const [appointmentToast, setAppointmentToast] = useState(false);

    const amRoutine = hasMounted ? getPatientRoutine('am') : undefined;
    const pmRoutine = hasMounted ? getPatientRoutine('pm') : undefined;
    const todayString = getTodayString();

    // Get next appointment
    const nextAppointment = hasMounted && currentPatient
        ? getNextPatientAppointment(currentPatient.id)
        : undefined;

    // Format appointment date for display
    const formattedAppointment = useMemo(() => {
        if (!nextAppointment) return null;

        const date = new Date(nextAppointment.date);
        return {
            dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
            dayNumber: date.getDate(),
            month: date.toLocaleDateString('es-ES', { month: 'short' }),
            time: nextAppointment.time,
            type: visitTypeLabels[nextAppointment.visitType] || 'Consulta',
            status: statusLabels[nextAppointment.status] || statusLabels.pending,
        };
    }, [nextAppointment]);

    // Calculate today's progress
    const amProgress = useMemo(() => {
        if (!hasMounted || !amRoutine) return { completed: 0, total: 0, percentage: 0 };
        return calculateDailyAdherence(adherenceLogs, amRoutine, todayString, 'am');
    }, [hasMounted, amRoutine, adherenceLogs, todayString]);

    const pmProgress = useMemo(() => {
        if (!hasMounted || !pmRoutine) return { completed: 0, total: 0, percentage: 0 };
        return calculateDailyAdherence(adherenceLogs, pmRoutine, todayString, 'pm');
    }, [hasMounted, pmRoutine, adherenceLogs, todayString]);

    // Combined progress
    const totalCompleted = amProgress.completed + pmProgress.completed;
    const totalProducts = amProgress.total + pmProgress.total;
    const overallPercentage = totalProducts > 0 ? Math.round((totalCompleted / totalProducts) * 100) : 0;

    // Show loading skeleton while fetching data
    if (isLoading && hasMounted) {
        return <DashboardSkeleton />;
    }

    const handleAppointmentCreated = () => {
        setAppointmentToast(true);
        setTimeout(() => setAppointmentToast(false), 3000);
    };

    return (
        <div className="min-h-screen relative pb-24 overflow-hidden">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* Decorative blurs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute top-1/2 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl -z-10" />

            {/* Success Toast */}
            <div
                className={cn(
                    'fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all duration-300',
                    appointmentToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                )}
            >
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-semibold">Cita solicitada con éxito</span>
            </div>

            {/* Appointment Request Sheet */}
            <RequestAppointmentSheet
                isOpen={showAppointmentSheet}
                onClose={() => setShowAppointmentSheet(false)}
                onAppointmentCreated={handleAppointmentCreated}
            />

            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-end">
                <div>
                    <p className="text-sm font-medium text-neutral-500">Bienvenida,</p>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        {currentPatient?.name?.split(' ')[0] || 'Paciente'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowNotificationSheet(true)}
                        className="w-12 h-12 rounded-full bg-white shadow-sm border border-neutral-100 flex items-center justify-center active:scale-95 transition-all text-neutral-400"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-primary/20 flex items-center justify-center">
                            {currentPatient?.avatarUrl ? (
                                <img
                                    alt="Perfil"
                                    className="w-full h-full object-cover"
                                    src={currentPatient.avatarUrl}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-primary">person</span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
                    </div>
                </div>
            </header>

            {/* Progress Card */}
            <section className="px-6 mb-8">
                <div className="bg-primary rounded-[2.5rem] p-6 shadow-xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <div className="flex items-center gap-6 relative z-10">
                        <CircularProgress
                            value={overallPercentage}
                            size={100}
                            strokeWidth={10}
                            showLabel
                        />
                        <div className="flex-1 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                                Progreso de Hoy
                            </p>
                            <h2 className="text-2xl font-black">
                                {totalCompleted} de {totalProducts}
                            </h2>
                            <p className="text-sm opacity-80 mt-1">productos completados</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="px-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        href="/patient/routine"
                        className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-3xl mb-2 text-primary">
                            checklist
                        </span>
                        <span className="text-sm font-semibold leading-tight">
                            Mi Rutina
                        </span>
                    </Link>

                    {/* Appointment Card - Opens RequestAppointmentSheet */}
                    <button
                        onClick={() => setShowAppointmentSheet(true)}
                        className="glass p-5 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-sm w-full active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-3xl mb-2 text-primary">
                            calendar_today
                        </span>
                        {formattedAppointment ? (
                            <>
                                <span className="text-sm font-semibold text-neutral-700">
                                    {formattedAppointment.dayNumber} {formattedAppointment.month}
                                </span>
                                <span className={cn(
                                    'text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1',
                                    formattedAppointment.status.color
                                )}>
                                    {formattedAppointment.status.label}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-semibold text-neutral-700">Próxima Cita</span>
                                <span className="text-[10px] text-neutral-400">Tap para solicitar</span>
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* Next Appointment Banner (if exists) */}
            {formattedAppointment && (
                <section className="px-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-[2rem] border border-blue-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                <span className="text-lg font-bold text-primary">{formattedAppointment.dayNumber}</span>
                                <span className="text-[10px] uppercase text-neutral-500 font-semibold">{formattedAppointment.month}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-secondary uppercase font-bold tracking-wider">Tu próxima cita</p>
                                <p className="font-bold text-neutral-800">
                                    {formattedAppointment.type} • {formattedAppointment.time}
                                </p>
                                <p className="text-xs text-neutral-500">con {currentPro?.name}</p>
                            </div>
                            <span className={cn(
                                'px-2 py-1 rounded-full text-[10px] font-bold',
                                formattedAppointment.status.color
                            )}>
                                {formattedAppointment.status.label}
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {/* Today's Routine */}
            <section className="px-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-neutral-900">Rutina de Hoy</h3>
                    <Link href="/patient/routine" className="text-sm text-primary font-medium">
                        Ver Todo
                    </Link>
                </div>
                <div className="space-y-4">
                    {/* Morning */}
                    <Link
                        href="/patient/routine"
                        className="glass p-4 rounded-[2rem] flex items-center space-x-4 active:scale-[0.98] transition-transform"
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50">
                            <span className="material-symbols-outlined text-amber-500">light_mode</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">Rutina Mañana</p>
                            <p className="text-xs text-neutral-500">
                                {amRoutine ? `${amRoutine.products.length} productos` : 'Sin asignar'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-neutral-400">
                                {amProgress.completed}/{amProgress.total}
                            </span>
                            {amProgress.percentage === 100 ? (
                                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-base">check</span>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-neutral-200" />
                            )}
                        </div>
                    </Link>

                    {/* Evening */}
                    <Link
                        href="/patient/routine"
                        className="glass p-4 rounded-[2rem] flex items-center space-x-4 active:scale-[0.98] transition-transform"
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50">
                            <span className="material-symbols-outlined text-indigo-500">dark_mode</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">Rutina Noche</p>
                            <p className="text-xs text-neutral-500">
                                {pmRoutine ? `${pmRoutine.products.length} productos` : 'Sin asignar'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-neutral-400">
                                {pmProgress.completed}/{pmProgress.total}
                            </span>
                            {pmProgress.percentage === 100 ? (
                                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-base">check</span>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-neutral-200" />
                            )}
                        </div>
                    </Link>
                </div>
            </section>

            {/* Doctor Info */}
            <section className="mt-8 px-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-50 ios-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {currentPro?.avatarUrl ? (
                            <img
                                src={currentPro.avatarUrl}
                                alt="Doctor"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-primary">person</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-secondary uppercase font-bold tracking-wider">Tu Especialista</p>
                        <p className="font-bold text-slate-800">{currentPro?.name || 'Sin asignar'}</p>
                    </div>
                    <button
                        onClick={() => router.push('/patient/chat')}
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                        aria-label="Chat con tu especialista"
                    >
                        <span className="material-symbols-outlined text-primary">chat</span>
                    </button>
                </div>
            </section>

            <NotificationSheet
                isOpen={showNotificationSheet}
                onClose={() => setShowNotificationSheet(false)}
            />
        </div>
    );
}
