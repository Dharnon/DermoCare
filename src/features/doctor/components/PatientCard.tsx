'use client';

import { cn } from '@/lib/utils';
import type { PatientSummary } from '@/lib/types';
import { AdherenceBar } from './AdherenceBar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface PatientCardProps {
    summary: PatientSummary;
}

export function PatientCard({ summary }: PatientCardProps) {
    const { patient, adherencePercentage, treatmentType, dayNumber, riskLevel } = summary;
    const { profile } = useAuth();

    return (
        <Link
            href={`/doctor/patients/${patient.id}`}
            className={cn(
                'bg-white p-4 rounded-3xl ios-shadow border border-slate-100',
                'flex items-center gap-4 group cursor-pointer',
                'hover:border-primary/40 transition-all duration-200',
                'active:scale-[0.98]'
            )}
        >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {patient.avatarUrl ? (
                    <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="material-symbols-outlined text-primary">person</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 pr-2">
                    <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                        {patient.name}
                    </h4>
                    {patient.invitedBy === profile?.id && (
                        <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md text-[8px] font-black border border-green-100 uppercase">
                            <span className="material-symbols-outlined text-[8px]">how_to_reg</span>
                            Mío
                        </span>
                    )}
                </div>
                <p className="text-xs text-secondary truncate">
                    {treatmentType} • Día {dayNumber}
                </p>
                <div className="mt-2">
                    <AdherenceBar
                        percentage={adherencePercentage}
                        riskLevel={riskLevel}
                        showLabel={false}
                    />
                </div>
            </div>

            {/* Adherence Badge */}
            <div className="flex flex-col items-end flex-shrink-0">
                <span
                    className={cn(
                        'text-lg font-black',
                        riskLevel === 'on-track' && 'text-green-500',
                        riskLevel === 'at-risk' && 'text-yellow-500',
                        riskLevel === 'critical' && 'text-red-500'
                    )}
                >
                    {adherencePercentage}%
                </span>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                    chevron_right
                </span>
            </div>
        </Link>
    );
}
