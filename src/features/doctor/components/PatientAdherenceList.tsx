'use client';

import { useState, useEffect } from 'react';
import { useDermoCareStore } from '@/lib/store';
import { PatientCard } from './PatientCard';

export function PatientAdherenceList() {
    const [hasMounted, setHasMounted] = useState(false);
    const { getPatientSummaries } = useDermoCareStore();

    // Hydration fix: wait for client mount
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const summaries = hasMounted ? getPatientSummaries() : [];

    // Sort by adherence (lowest first to highlight at-risk patients)
    const sortedSummaries = [...summaries].sort(
        (a, b) => a.adherencePercentage - b.adherencePercentage
    );

    return (
        <section>
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl font-bold text-slate-800">Mis Pacientes</h2>
                <span className="text-sm text-secondary">{summaries.length} activos</span>
            </div>
            <div className="space-y-3">
                {!hasMounted ? (
                    // Skeleton loading state
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                                        <div className="h-3 bg-slate-100 rounded w-32" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    sortedSummaries.map((summary) => (
                        <PatientCard key={summary.patient.id} summary={summary} />
                    ))
                )}
            </div>
        </section>
    );
}
