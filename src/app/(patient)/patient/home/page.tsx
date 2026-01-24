"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock data
const routinePreview = [
    {
        id: "1",
        name: "Morning Care",
        description: "Hydrating Cleanser + SPF",
        time: "08:00 AM",
        completed: true,
        icon: "☀️",
    },
    {
        id: "2",
        name: "Evening Care",
        description: "Retinol Serum + Night Cream",
        time: "09:00 PM",
        completed: false,
        icon: "🌙",
    },
];

const prescribedProducts = [
    { id: "1", name: "Avene Cleanser", frequency: "2x Daily", icon: "🧴" },
    { id: "2", name: "Tretinoin 0.05%", frequency: "Nightly", icon: "💊" },
    { id: "3", name: "Hyaluronic", frequency: "Morning", icon: "💧" },
];

export default function PatientHomePage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between animate-in">
                <div>
                    <p className="text-gray-500">Welcome back,</p>
                    <h1 className="text-3xl font-black text-gray-900">Elena Rose</h1>
                </div>
                <Avatar size="lg" className="ring-4 ring-pink-100">
                    <AvatarImage src="/avatars/elena.png" />
                    <AvatarFallback>ER</AvatarFallback>
                </Avatar>
            </header>

            {/* Skin Improvement Chart */}
            <Card className="animate-in" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Skin Improvement</h3>
                        <p className="text-sm text-gray-500">Tracking over 30 days</p>
                    </div>
                    <Badge variant="confirmed" className="text-sm">
                        +12%
                    </Badge>
                </div>

                {/* Chart placeholder */}
                <div className="h-32 relative">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F472B6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,80 Q50,75 100,50 T200,30 T300,20"
                            fill="none"
                            stroke="#F472B6"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M0,80 Q50,75 100,50 T200,30 T300,20 L300,100 L0,100 Z"
                            fill="url(#chartGradient)"
                        />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
                        <span>WEEK 1</span>
                        <span>WEEK 2</span>
                        <span>WEEK 3</span>
                        <span>WEEK 4</span>
                    </div>
                </div>
            </Card>

            {/* Quick Actions */}
            <div
                className="grid grid-cols-2 gap-4 animate-in"
                style={{ animationDelay: "100ms" }}
            >
                <Link href="/patient/upload">
                    <div className="bg-gradient-to-br from-coral to-orange-400 rounded-3xl p-5 text-white shadow-medium hover:shadow-elevated transition-all hover:scale-[1.02]">
                        <Camera className="h-8 w-8 mb-3 opacity-90" />
                        <p className="font-bold">Upload Progress</p>
                        <p className="text-sm opacity-80">Photo</p>
                    </div>
                </Link>
                <div className="bg-white rounded-3xl p-5 shadow-soft">
                    <Calendar className="h-8 w-8 mb-3 text-gray-400" />
                    <p className="font-bold text-gray-900">Next Visit</p>
                    <p className="text-sm text-gray-500">Oct 24, 10:30 AM</p>
                </div>
            </div>

            {/* Today's Routine */}
            <section className="animate-in" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Today&apos;s Routine</h3>
                    <Link
                        href="/patient/routine"
                        className="text-sm font-semibold text-coral hover:text-coral/80"
                    >
                        View Plan
                    </Link>
                </div>
                <div className="space-y-3">
                    {routinePreview.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400">{item.time}</span>
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center",
                                        item.completed
                                            ? "bg-green-500 text-white"
                                            : "border-2 border-gray-200"
                                    )}
                                >
                                    {item.completed && (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Prescribed Products */}
            <section className="animate-in" style={{ animationDelay: "200ms" }}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Prescribed</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
                    {prescribedProducts.map((product) => (
                        <Link
                            key={product.id}
                            href={`/patient/products/${product.id}`}
                            className="flex-shrink-0"
                        >
                            <div className="bg-white rounded-2xl p-4 shadow-soft w-[120px] text-center hover:shadow-medium transition-all">
                                <div className="w-14 h-14 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-2xl mb-2">
                                    {product.icon}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-gray-500">{product.frequency}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
