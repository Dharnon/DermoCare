'use client';

import { useDermoCareStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext'; // Added
import { StatsCard } from '@/features/doctor/components/stats-card';
import { PendingReviews } from '@/features/doctor/components/pending-reviews';
import { PatientAdherenceList } from '@/features/doctor/components/PatientAdherenceList';
import { InvitePatientSheet } from '@/features/doctor/components/InvitePatientSheet';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/ui-store';
import Link from 'next/link';

// Mock pending reviews data
const pendingReviews = [
    {
        id: '1',
        patientName: 'Elena Gilbert',
        condition: 'Tratamiento Acné',
        day: 14,
        hasNewUpdate: true,
        patientAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCji5F1_QArQELogjT3aonVVgieY10JSt9SDXLQVccy1G3sjWGW-vUnCA2OA7XV1MBlmP1v9aaD9peUWGRcOYF2cg1ULSNe7sbJf4UUc0U_AYfy7AgWo50Z1b4UxRiB4AvlVObW5XX9AhOfAPXH9yVm4agCm8a9J2aupPWpTITQY8g1c1l-Qmqf94f96BrRYRcU7ZHpaURBZXfgOyghOZJSbdQVj5-KY7UcKFr31I9Mq-Zj1_QxDLG8-b-iLQZYdnp8RT8Tnx-ae3c',
    },
    {
        id: '2',
        patientName: 'Stefan Salvatore',
        condition: 'Cuidado Eczema',
        day: 7,
        patientAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuB0r-Aoz5_kPcTwk6xXUmtllj8x74kC0L-rY3cNgnYnhLLokUYrTcxAkGt1bDcLbmsyl9Iac6kBhpV0g-DArVJqT02_AyFI4v6Tq12T45cGE8zFWP8xkdkSDv1pZ2_2jFlmodCxLOvI69ONR4ZGHMlHDuDp36XY0DJNK_qnvcTcKu-PuNpz-fCExOakEY6WKSwJncKBhT_5sMG75QKEuCQXSgZnvLTO0wp357fSOG7gHwkLG2rUNW6r76rfoRYbrw4JDJhuOEiWvwo',
    },
];

export default function DoctorDashboardPage() {
    const { currentPro, patients } = useDermoCareStore();
    const { profile } = useAuth(); // Added
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const { setFab, hideFab } = useUIStore();

    useEffect(() => {
        setFab(() => setIsInviteOpen(true), 'person_add');
        return () => hideFab();
    }, [setFab, hideFab]);

    // Derived display values
    const displayName = profile?.name || currentPro?.name || 'Doctor';
    const displayAvatar = profile?.avatar_url || currentPro?.avatarUrl;

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            <main className="max-w-md mx-auto px-6 pb-32">
                {/* Header */}
                <header className="mt-6 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            DermoCare
                        </h1>
                        <p className="text-[#7A869A] font-medium text-sm">
                            Hola, {displayName}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#F8C6B9]/30 flex items-center justify-center overflow-hidden ios-shadow">
                        {displayAvatar ? (
                            <img
                                src={displayAvatar}
                                alt="Doctor"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-primary">
                                person
                            </span>
                        )}
                    </div>
                </header>

                {/* Search */}
                <div className="relative mb-6">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar pacientes o condiciones..."
                        className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 ios-shadow focus:ring-2 focus:ring-[#F8C6B9]/50 transition-all text-sm outline-none"
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <StatsCard
                        icon="group"
                        value={patients.filter((p) => p.role === 'patient').length}
                        label="Pacientes Activos"
                        iconBgColor="bg-[#F8C6B9]/20"
                        iconColor="text-[#F8C6B9]"
                    />
                    <StatsCard
                        icon="calendar_today"
                        value="08"
                        label="Consultas Hoy"
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-500"
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 ml-1">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setIsInviteOpen(true)}
                            className="bg-white p-5 rounded-[2rem] ios-shadow border border-slate-50 flex flex-col items-center justify-center text-center active:scale-95 transition-all group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">person_add</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">Invitar Paciente</span>
                        </button>

                        <Link
                            href="/doctor/tools"
                            className="bg-white p-5 rounded-[2rem] ios-shadow border border-slate-50 flex flex-col items-center justify-center text-center active:scale-95 transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">edit_document</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">Nueva Plantilla</span>
                        </Link>
                    </div>
                </div>

                {/* Pending Reviews */}
                <div className="mb-8">
                    <PendingReviews reviews={pendingReviews} />
                </div>

                {/* Patient Adherence List */}
                <div>
                    <PatientAdherenceList />
                </div>
            </main>


            <InvitePatientSheet
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />
        </div>
    );
}

