'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { AdherenceBar } from '@/features/doctor/components/AdherenceBar';
import { InvitePatientSheet } from '@/features/doctor/components/InvitePatientSheet';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClaimPatientSheet } from '@/features/doctor/components/ClaimPatientSheet';
import { User } from '@/lib/types';

const tabs = ['Todos', 'Activos', 'En Riesgo', 'Pendientes'] as const;
type TabType = (typeof tabs)[number];

export default function PatientsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const {
        getPatientSummaries,
        patients: allPatients,
        claimPatient,
        fetchDoctorData,
        currentPro,
        professionals,
        fetchProfessionals,
        subscribeToDoctorEvents,
        unsubscribeFromAll
    } = useDermoCareStore();
    const { profile } = useAuth();
    const { setFab, hideFab } = useUIStore();
    const [claimingPatient, setClaimingPatient] = useState<User | null>(null);

    useEffect(() => {
        setFab(() => setIsInviteOpen(true), 'person_add');
        return () => hideFab();
    }, [setFab, hideFab]);

    useEffect(() => {
        if (profile?.organization_id) {
            fetchProfessionals(profile.organization_id);
        }
    }, [profile?.organization_id, fetchProfessionals]);

    useEffect(() => {
        const proId = profile?.id || currentPro?.id;
        if (proId) {
            fetchDoctorData(proId);
            subscribeToDoctorEvents(proId);
        }
        return () => unsubscribeFromAll();
    }, [profile, currentPro?.id, fetchDoctorData, subscribeToDoctorEvents, unsubscribeFromAll]);

    const allSummaries = getPatientSummaries().filter(s => s.patient.organization_id);
    const pendingPatients = allPatients.filter(p => p.role === 'patient' && !p.organization_id);

    // Filter by tab
    const filteredByTab = activeTab === 'Pendientes'
        ? [] // Summaries are for assigned patients
        : allSummaries.filter((summary) => {
            if (activeTab === 'Todos') return true;
            if (activeTab === 'Activos') return summary.riskLevel === 'on-track';
            if (activeTab === 'En Riesgo') return summary.riskLevel === 'critical' || summary.riskLevel === 'at-risk';
            return true;
        });

    // Filter by search
    const filteredPatients = filteredByTab.filter((summary) =>
        summary.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.patient.contactInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePatientClick = (patientId: string) => {
        router.push(`/doctor/patients/${patientId}`);
    };

    return (
        <div className="min-h-screen pb-32">
            <InvitePatientSheet
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />

            <ClaimPatientSheet
                isOpen={!!claimingPatient}
                onClose={() => setClaimingPatient(null)}
                onSelect={async (proId) => {
                    if (claimingPatient) {
                        await claimPatient(claimingPatient.id, proId);
                        setClaimingPatient(null);
                    }
                }}
                professionals={allPatients.filter(p => p.role === 'pro')}
                patientName={claimingPatient?.name || ''}
            />

            {/* Header */}
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Pacientes</h1>
                <p className="text-secondary text-sm font-medium">Gestiona y realiza seguimiento a tus pacientes</p>
            </header>

            {/* Search Bar */}
            <div className="px-6 mb-6">
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl ios-shadow border border-neutral-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar px-6 mb-8 py-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                            activeTab === tab
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "bg-white text-secondary border border-neutral-100 ios-shadow hover:bg-neutral-50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Patients List */}
            <div className="px-6 space-y-4">
                {activeTab === 'Pendientes' ? (
                    pendingPatients.length > 0 ? (
                        pendingPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="bg-white p-5 rounded-[2rem] border border-neutral-50 ios-shadow flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
                                        {patient.avatarUrl ? (
                                            <img alt={patient.name} className="w-full h-full object-cover" src={patient.avatarUrl} />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary text-2xl">person_search</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-800">{patient.name}</h3>
                                        <p className="text-[11px] text-secondary font-medium">{patient.contactInfo?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setClaimingPatient(patient)}
                                    className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
                                >
                                    Vincular
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <span className="material-symbols-outlined text-5xl mb-3">person_search</span>
                            <p className="font-bold text-sm">No hay pacientes pendientes</p>
                        </div>
                    )
                ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((summary) => (
                        <button
                            key={summary.patient.id}
                            onClick={() => handlePatientClick(summary.patient.id)}
                            className="w-full bg-white p-5 rounded-[2.5rem] border border-neutral-50 ios-shadow transition-all active:scale-[0.98] text-left group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-white ios-shadow group-hover:scale-105 transition-transform">
                                        {summary.patient.avatarUrl ? (
                                            <img
                                                alt={summary.patient.name}
                                                className="w-full h-full object-cover"
                                                src={summary.patient.avatarUrl}
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 leading-tight mb-0.5">{summary.patient.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                                                {/* Cita info could be added if available in summary */}
                                                Ver Detalles
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <span className="material-symbols-outlined text-neutral-400 group-hover:text-primary transition-colors">chevron_right</span>
                                </div>
                            </div>

                            {/* Adherence Bar */}
                            <AdherenceBar
                                percentage={summary.adherencePercentage}
                                riskLevel={summary.riskLevel}
                            />
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="material-symbols-outlined text-5xl mb-3">group_off</span>
                        <p className="font-bold text-sm">No se encontraron pacientes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
