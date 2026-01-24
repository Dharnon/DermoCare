'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { AdherenceBar } from '@/features/doctor/components/AdherenceBar';
import { AddPatientForm } from '@/features/doctor/components/AddPatientForm';
import { useRouter } from 'next/navigation';

const tabs = ['Todos', 'Activos', 'En Riesgo'] as const;
type TabType = (typeof tabs)[number];

export default function PatientsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddPatient, setShowAddPatient] = useState(false);

    const { getPatientSummaries } = useDermoCareStore();
    const { setFab, hideFab } = useUIStore();
    const allSummaries = getPatientSummaries();

    // Set global FAB action
    useEffect(() => {
        setFab(() => setShowAddPatient(true), 'person_add');
        return () => hideFab();
    }, [setFab, hideFab]);

    // Filter by tab
    const filteredByTab = allSummaries.filter((summary) => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Activos') return summary.riskLevel === 'on-track';
        if (activeTab === 'En Riesgo') return summary.riskLevel === 'at-risk' || summary.riskLevel === 'critical';
        return true;
    });

    // Filter by search
    const patients = filteredByTab.filter((summary) =>
        summary.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePatientAdded = (patientId: string) => {
        router.push(`/doctor/patients/${patientId}`);
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            <main className="max-w-md mx-auto px-6 pb-32">
                {/* Header */}
                <header className="mt-6 mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Pacientes
                        </h1>
                    </div>
                    <p className="text-[#7A869A] font-medium text-sm">
                        {allSummaries.length} pacientes activos
                    </p>
                </header>

                {/* Search */}
                <div className="relative mb-6">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 ios-shadow focus:ring-2 focus:ring-[#F8C6B9]/50 transition-all text-sm outline-none"
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
                                activeTab === tab
                                    ? 'bg-white shadow-sm text-slate-900'
                                    : 'text-[#7A869A]'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Patient List */}
                <section className="space-y-3">
                    {patients.length > 0 ? (
                        patients.map((summary) => (
                            <Link
                                key={summary.patient.id}
                                href={`/doctor/patients/${summary.patient.id}`}
                                className={cn(
                                    'block bg-white p-4 rounded-3xl ios-shadow border border-slate-50',
                                    'hover:border-primary/40 transition-all',
                                    'active:scale-[0.98]'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {summary.patient.avatarUrl ? (
                                            <img
                                                src={summary.patient.avatarUrl}
                                                alt={summary.patient.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary text-2xl">
                                                person
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">
                                            {summary.patient.name}
                                        </h3>
                                        <p className="text-xs text-secondary truncate">
                                            {summary.treatmentType} • Día {summary.dayNumber}
                                        </p>
                                        <div className="mt-2">
                                            <AdherenceBar
                                                percentage={summary.adherencePercentage}
                                                riskLevel={summary.riskLevel}
                                                showLabel={false}
                                            />
                                        </div>
                                    </div>

                                    {/* Adherence Badge */}
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <span
                                            className={cn(
                                                'text-xl font-black',
                                                summary.riskLevel === 'on-track' && 'text-green-500',
                                                summary.riskLevel === 'at-risk' && 'text-yellow-500',
                                                summary.riskLevel === 'critical' && 'text-red-500'
                                            )}
                                        >
                                            {summary.adherencePercentage}%
                                        </span>
                                        <span className="material-symbols-outlined text-slate-300">
                                            chevron_right
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12 text-secondary">
                            <span className="material-symbols-outlined text-5xl opacity-30">
                                person_search
                            </span>
                            <p className="mt-4 font-medium">
                                {searchQuery
                                    ? 'No se encontraron pacientes'
                                    : 'Sin pacientes en esta categoría'}
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {/* Add Patient Form */}
            <AddPatientForm
                isOpen={showAddPatient}
                onClose={() => setShowAddPatient(false)}
                onSuccess={handlePatientAdded}
            />
        </div>
    );
}
