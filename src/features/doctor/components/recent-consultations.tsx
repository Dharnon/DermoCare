"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface Consultation {
    id: string;
    patientName: string;
    patientAvatar?: string;
    treatment: string;
    status: "completed" | "ongoing" | "scheduled";
    time: string;
}

interface RecentConsultationsProps {
    consultations: Consultation[];
}

export function RecentConsultations({ consultations }: RecentConsultationsProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-slate-900">Recent Consultations</h2>
                <Link
                    href="/doctor/history"
                    className="text-sm font-semibold text-[#F4A492] hover:text-[#F4A492]/80 transition-colors"
                >
                    History
                </Link>
            </div>

            <div className="space-y-3">
                {consultations.map((consultation) => (
                    <Link
                        key={consultation.id}
                        href={`/doctor/patients/${consultation.id}`}
                        className="block"
                    >
                        <div className="bg-white rounded-2xl p-4 ios-shadow flex items-center gap-4 transition-all duration-200 hover:shadow-md">
                            <img
                                src={consultation.patientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${consultation.patientName}`}
                                alt={consultation.patientName}
                                className="w-12 h-12 rounded-2xl object-cover"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900">{consultation.patientName}</p>
                                <p className="text-sm text-[#7A869A] flex items-center gap-1">
                                    {consultation.treatment} •{" "}
                                    <span
                                        className={cn(
                                            "capitalize",
                                            consultation.status === "completed" && "text-slate-400",
                                            consultation.status === "ongoing" && "text-[#F4A492]",
                                            consultation.status === "scheduled" && "text-blue-500"
                                        )}
                                    >
                                        {consultation.status}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <span
                                    className={cn(
                                        "font-medium",
                                        consultation.status === "ongoing"
                                            ? "text-[#F4A492]"
                                            : "text-slate-400"
                                    )}
                                >
                                    {consultation.time}
                                </span>
                                <span className="material-symbols-outlined text-slate-300">
                                    chevron_right
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
