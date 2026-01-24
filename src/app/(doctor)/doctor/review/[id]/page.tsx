"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Check,
    Clock,
    Mic,
    Pen,
    Type,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data
const pendingReviews = [
    { id: "1", name: "Stefan Salvatore", condition: "Eczema", day: 3 },
    { id: "2", name: "Caroline Forbes", condition: "Laser", day: 7 },
];

export default function ReviewProgressPage() {
    const [observation, setObservation] = useState("");

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/doctor/dashboard"
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Link>
                    <div className="text-center">
                        <h1 className="font-bold text-gray-900">Review Patient Progress</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                            ELENA GILBERT • DAY 14
                        </p>
                    </div>
                    <Avatar size="sm" className="ring-2 ring-pink-100">
                        <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <div className="px-6 pb-8 space-y-6">
                {/* Photo Comparison */}
                <section className="animate-in">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Day 0 */}
                        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-soft">
                            <Badge className="absolute bottom-4 left-4 bg-gray-800/80 text-white px-3 py-1">
                                DAY 0
                            </Badge>
                        </div>

                        {/* Day 14 */}
                        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50 to-coral-light shadow-soft">
                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                                <Check className="h-5 w-5 text-coral" />
                            </div>
                            <Badge className="absolute bottom-4 left-4 bg-coral/90 text-white px-3 py-1">
                                DAY 14
                            </Badge>
                        </div>
                    </div>

                    {/* Tools */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <button className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-200 transition-colors">
                            <Pen className="h-5 w-5" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                            <Type className="h-5 w-5" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                            <Clock className="h-5 w-5" />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-coral-light text-coral font-semibold hover:bg-coral/20 transition-colors">
                            <Mic className="h-5 w-5" />
                            REC VOICE
                        </button>
                    </div>
                </section>

                {/* Doctor's Observation */}
                <section className="animate-in">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">
                        DOCTOR&apos;S OBSERVATION
                    </label>
                    <div className="bg-white rounded-2xl shadow-soft">
                        <textarea
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder="Add specific notes about the inflammatory lesions or progress..."
                            className="w-full p-4 rounded-2xl resize-none h-32 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                    </div>
                </section>

                {/* Pending Reviews */}
                <section className="animate-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Pending Reviews</h3>
                        <Badge variant="prescribed" className="text-xs">
                            3 REMAINING
                        </Badge>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
                        {pendingReviews.map((review) => (
                            <Link
                                key={review.id}
                                href={`/doctor/review/${review.id}`}
                                className="flex-shrink-0"
                            >
                                <div className="bg-white rounded-2xl p-3 shadow-soft w-[140px] hover:shadow-medium transition-all">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 mb-2" />
                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                        {review.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {review.condition} • Day {review.day}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button variant="secondary" className="flex-1">
                        SKIP
                    </Button>
                    <Button variant="coral" className="flex-1">
                        <Check className="h-5 w-5 mr-2" />
                        SUBMIT REVIEW
                    </Button>
                </div>
            </div>
        </div>
    );
}
