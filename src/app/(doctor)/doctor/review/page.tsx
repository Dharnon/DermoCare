"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const pendingReviews = [
    {
        id: "1",
        name: "Stefan Salvatore",
        condition: "Eczema",
        day: 3,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    },
    {
        id: "2",
        name: "Caroline Forbes",
        condition: "Laser",
        day: 7,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    },
];

export default function ReviewPage() {
    const [activeTool, setActiveTool] = useState<"gesture" | "text" | "history">("gesture");
    const [observation, setObservation] = useState("");

    return (
        <div className="min-h-screen pb-40">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex items-center gap-4">
                <Link
                    href="/doctor/patients"
                    className="w-10 h-10 rounded-full bg-white ios-shadow flex items-center justify-center border border-neutral-100"
                >
                    <span className="material-symbols-outlined text-neutral-600">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 leading-tight">
                        Review Patient Progress
                    </h1>
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider">
                        Elena Gilbert • Day 14
                    </p>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* Photo Comparison Card */}
                <section className="bg-white p-3 rounded-[2.5rem] ios-shadow border border-neutral-50">
                    {/* Before/After Images */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {/* Day 0 */}
                        <div className="relative">
                            <img
                                alt="Day 0"
                                className="w-full aspect-[3/4] object-cover rounded-[1.8rem] border border-neutral-100"
                                src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=300"
                            />
                            <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                                <span className="text-[10px] text-white font-bold uppercase tracking-tight leading-none">
                                    Day 0
                                </span>
                            </div>
                        </div>

                        {/* Day 14 (Current/Active) */}
                        <div className="relative">
                            <img
                                alt="Day 14"
                                className="w-full aspect-[3/4] object-cover rounded-[1.8rem] border-2 border-primary"
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
                            />
                            <div className="absolute bottom-3 left-3 bg-primary backdrop-blur-md px-3 py-1 rounded-full">
                                <span className="text-[10px] text-white font-bold uppercase tracking-tight leading-none">
                                    Day 14
                                </span>
                            </div>
                            <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-sm">
                                <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                            </div>
                        </div>
                    </div>

                    {/* Annotation Tools */}
                    <div className="flex items-center justify-between px-2 pb-1">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTool("gesture")}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    activeTool === "gesture" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"
                                )}
                            >
                                <span className="material-symbols-outlined text-[20px]">gesture</span>
                            </button>
                            <button
                                onClick={() => setActiveTool("text")}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    activeTool === "text" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"
                                )}
                            >
                                <span className="material-symbols-outlined text-[20px]">text_fields</span>
                            </button>
                            <button
                                onClick={() => setActiveTool("history")}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    activeTool === "history" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"
                                )}
                            >
                                <span className="material-symbols-outlined text-[20px]">history</span>
                            </button>
                        </div>

                        {/* Voice Recording Button */}
                        <button className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[18px]">mic</span>
                            Rec Voice
                        </button>
                    </div>
                </section>

                {/* Doctor's Observation */}
                <section className="bg-white p-5 rounded-[2rem] ios-shadow border border-neutral-50">
                    <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest mb-2">
                        Doctor's Observation
                    </label>
                    <textarea
                        className="w-full bg-neutral-50 border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary h-24 resize-none"
                        placeholder="Add specific notes about the inflammatory lesions or progress..."
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                    />
                </section>

                {/* Pending Reviews */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="text-lg font-bold">Pending Reviews</h2>
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                            3 Remaining
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {pendingReviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-white p-3 rounded-[2rem] ios-shadow border border-neutral-50 opacity-60"
                            >
                                <div className="relative rounded-2xl overflow-hidden mb-2 aspect-square">
                                    <img
                                        alt={review.name}
                                        className="w-full h-full object-cover"
                                        src={review.image}
                                    />
                                </div>
                                <h3 className="font-bold text-xs truncate">{review.name}</h3>
                                <p className="text-[10px] text-secondary">
                                    {review.condition} • Day {review.day}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Bottom Action Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-neutral-100 px-6 py-5 pb-8 z-50">
                <div className="max-w-md mx-auto flex gap-3">
                    <button className="flex-1 py-4 bg-neutral-100 text-neutral-600 font-bold rounded-2xl text-sm active:scale-95 transition-transform uppercase tracking-wider">
                        Skip
                    </button>
                    <button className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl text-sm ios-shadow active:scale-95 transition-transform uppercase tracking-wider flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Submit Review
                    </button>
                </div>
            </nav>
        </div>
    );
}
