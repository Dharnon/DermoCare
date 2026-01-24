"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface PatientCardData {
    id: string;
    name: string;
    condition: string;
    conditionSeverity: "mild" | "moderate" | "severe";
    lastUpdate: string;
    adherence: number;
    avatar?: string;
    isOnline?: boolean;
}

interface PatientCardProps {
    patient: PatientCardData;
}

export function PatientCard({ patient }: PatientCardProps) {
    const isLowAdherence = patient.adherence < 50;
    const isCritical = patient.conditionSeverity === "severe";

    return (
        <Link href={`/doctor/patients/${patient.id}`}>
            <div
                className={cn(
                    "bg-white p-4 rounded-3xl ios-shadow transition-all duration-200 hover:shadow-md",
                    isCritical ? "border border-red-100" : "border border-slate-100"
                )}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={patient.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
                                alt={patient.name}
                                className="w-14 h-14 rounded-2xl object-cover"
                            />
                            <div
                                className={cn(
                                    "absolute -top-1 -right-1 w-3 h-3 border-2 border-white rounded-full",
                                    patient.isOnline
                                        ? "bg-green-500"
                                        : isCritical
                                            ? "bg-red-500 animate-pulse"
                                            : "bg-slate-300"
                                )}
                            />
                        </div>

                        {/* Info */}
                        <div>
                            <h3 className="font-bold text-slate-900">{patient.name}</h3>
                            <p
                                className={cn(
                                    "text-xs font-semibold uppercase tracking-wide",
                                    isCritical ? "text-red-400" : "text-[#F8C6B9]"
                                )}
                            >
                                {patient.condition}
                            </p>
                            <p className="text-[10px] text-[#7A869A] mt-1">
                                Last update: {patient.lastUpdate}
                            </p>
                        </div>
                    </div>

                    {/* Menu button */}
                    <button className="text-slate-300">
                        <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                </div>

                {/* Adherence bar */}
                <div className="bg-slate-50 p-3 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-[#7A869A] uppercase tracking-widest">
                            Adherence
                        </span>
                        <span className="text-[10px] font-bold text-slate-900">
                            {patient.adherence}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                isLowAdherence ? "bg-red-400" : "sparkline-gradient"
                            )}
                            style={{ width: `${patient.adherence}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
