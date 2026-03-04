"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Products", "Progress"] as const;
type TabType = (typeof tabs)[number];

const treatmentData = {
    id: "1",
    name: "Acne Vulgaris Treatment",
    condition: "Acne Vulgaris",
    doctorName: "Dr. Sarah Chen",
    startDate: "Jan 3, 2026",
    expectedDuration: "30 days",
    daysRemaining: 16,
    adherence: 92,
    doctorNotes: "Focus on hydration and avoid harsh scrubbing. The tretinoin should be applied only 3x per week to prevent irritation.",
};

const routines = [
    {
        id: "morning",
        name: "Morning Care",
        time: "08:00 AM",
        icon: "light_mode",
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50",
        steps: [
            { id: "1", product: "Gentle Cleansing Gel", instruction: "Apply to damp skin" },
            { id: "2", product: "Hyaluronic Serum", instruction: "3-4 drops on face" },
            { id: "3", product: "SPF 50 Sunscreen", instruction: "Generous application" },
        ],
    },
    {
        id: "evening",
        name: "Evening Care",
        time: "09:00 PM",
        icon: "dark_mode",
        iconColor: "text-indigo-500",
        bgColor: "bg-indigo-50",
        steps: [
            { id: "4", product: "Gentle Cleansing Gel", instruction: "Double cleanse" },
            { id: "5", product: "Tretinoin Cream 0.05%", instruction: "Pea-sized, 3x week" },
            { id: "6", product: "Night Moisturizer", instruction: "Lock in hydration" },
        ],
    },
];

export default function TreatmentDetailPage() {
    const [activeTab, setActiveTab] = useState<TabType>("Overview");

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex items-center gap-4">
                <Link
                    href="/patient/treatments"
                    className="w-10 h-10 rounded-full bg-white ios-shadow flex items-center justify-center border border-neutral-100"
                >
                    <span className="material-symbols-outlined text-neutral-600">arrow_back_ios_new</span>
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold">{treatmentData.name}</h1>
                    <p className="text-xs text-secondary">{treatmentData.condition}</p>
                </div>
            </header>

            {/* Progress Summary Card */}
            <section className="px-6 mb-6">
                <div className="bg-white p-5 rounded-[2rem] ios-shadow border border-neutral-50">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Treatment Adherence</p>
                            <p className="text-3xl font-bold text-primary">{treatmentData.adherence}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Days Left</p>
                            <p className="text-3xl font-bold">{treatmentData.daysRemaining}</p>
                        </div>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${100 - (treatmentData.daysRemaining / 30) * 100}%` }}
                        />
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <div className="px-6 mb-6">
                <div className="flex border-b border-neutral-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-3 text-sm font-semibold border-b-2 transition-all",
                                activeTab === tab
                                    ? "text-neutral-900 border-primary font-bold"
                                    : "text-secondary border-transparent"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-6">
                {activeTab === "Overview" && (
                    <div className="space-y-6">
                        {/* Doctor Info */}
                        <section>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                Prescribing Doctor
                            </h3>
                            <div className="bg-white p-4 rounded-[2rem] ios-shadow border border-neutral-50 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">stethoscope</span>
                                </div>
                                <div>
                                    <p className="font-bold">{treatmentData.doctorName}</p>
                                    <p className="text-xs text-secondary">Dermatologist</p>
                                </div>
                                <button className="ml-auto bg-primary/10 p-2 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">chat</span>
                                </button>
                            </div>
                        </section>

                        {/* Doctor Notes */}
                        <section>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_note</span>
                                Doctor&apos;s Notes
                            </h3>
                            <div className="bg-white p-5 rounded-[2rem] ios-shadow border border-neutral-50">
                                <p className="text-sm text-neutral-600 leading-relaxed italic">
                                    &quot;{treatmentData.doctorNotes}&quot;
                                </p>
                            </div>
                        </section>

                        {/* Daily Routines */}
                        <section>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                Daily Routines
                            </h3>
                            <div className="space-y-4">
                                {routines.map((routine) => (
                                    <div key={routine.id} className="bg-white p-4 rounded-[2rem] ios-shadow border border-neutral-50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", routine.bgColor)}>
                                                <span className={cn("material-symbols-outlined", routine.iconColor)}>{routine.icon}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{routine.name}</p>
                                                <p className="text-[10px] text-secondary">{routine.time}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-13">
                                            {routine.steps.map((step, idx) => (
                                                <Link
                                                    key={step.id}
                                                    href={`/patient/products/${step.id}`}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors"
                                                >
                                                    <span className="text-xs font-bold text-neutral-400 w-4">{idx + 1}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold">{step.product}</p>
                                                        <p className="text-[10px] text-secondary">{step.instruction}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-neutral-300 text-lg">chevron_right</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "Products" && (
                    <div className="space-y-4">
                        {routines.flatMap((r) => r.steps).map((step) => (
                            <Link
                                key={step.id}
                                href={`/patient/products/${step.id}`}
                                className="block bg-white p-4 rounded-[2rem] ios-shadow border border-neutral-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-neutral-400">sanitizer</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold">{step.product}</p>
                                        <p className="text-xs text-secondary">{step.instruction}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-neutral-300">chevron_right</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {activeTab === "Progress" && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-neutral-200 mb-4">add_a_photo</span>
                        <p className="text-secondary">Track your progress with photos</p>
                        <Link
                            href="/patient/progress"
                            className="inline-block mt-4 bg-primary text-white font-bold py-3 px-6 rounded-2xl"
                        >
                            View Progress
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
