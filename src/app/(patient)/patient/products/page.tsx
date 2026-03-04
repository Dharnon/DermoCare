"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    brand: string;
    size: string;
    category: "hydration" | "acne" | "protection";
    categoryLabel: string;
    icon: string;
}

// Mock data
const prescribedProducts: Product[] = [
    {
        id: "1",
        name: "Gentle Cleanser",
        brand: "CeraVe",
        size: "250ml",
        category: "hydration",
        categoryLabel: "HYDRATION",
        icon: "💧",
    },
    {
        id: "2",
        name: "Tretinoin 0.05%",
        brand: "Galderma",
        size: "30g",
        category: "acne",
        categoryLabel: "ACNE CONTROL",
        icon: "🧴",
    },
    {
        id: "3",
        name: "Mineral SPF 50+",
        brand: "La Roche-Posay",
        size: "50ml",
        category: "protection",
        categoryLabel: "PROTECTION",
        icon: "☀️",
    },
];

const suggestedProducts = [
    {
        id: "4",
        name: "Night Repair",
        description: "Lipid Barrier Cream",
        timing: "EVENING",
        emoji: "🌙",
    },
    {
        id: "5",
        name: "Soothing Mask",
        description: "Green Tea Extract",
        timing: "WEEKLY",
        emoji: "😊",
    },
];

export default function ProductsLibraryPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/patient/home"
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Link>
                    <h1 className="font-bold text-gray-900">Products Library</h1>
                    <div className="w-10" />
                </div>
            </header>

            <div className="px-6 pb-8 space-y-6">
                {/* Your Routine */}
                <section className="animate-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Your Routine</h3>
                        <Badge variant="prescribed" className="text-xs">
                            4 PRESCRIBED
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {prescribedProducts.map((product, index) => (
                            <Link
                                key={product.id}
                                href={`/patient/products/${product.id}`}
                                className="block animate-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-4 hover:shadow-medium transition-all">
                                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                                        {product.icon}
                                    </div>
                                    <div className="flex-1">
                                        <Badge
                                            variant={product.category}
                                            className="text-[10px] mb-1"
                                        >
                                            {product.categoryLabel}
                                        </Badge>
                                        <h4 className="font-bold text-gray-900">{product.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {product.brand} • {product.size}
                                        </p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <Info className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Suggested for you */}
                <section className="animate-in" style={{ animationDelay: "150ms" }}>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Suggested for you</h3>
                        <p className="text-sm text-gray-500">Based on your recent progress</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {suggestedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl p-4 shadow-soft"
                            >
                                <div className="w-16 h-16 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-3xl mb-3">
                                    {product.emoji}
                                </div>
                                <Badge
                                    variant={product.timing === "EVENING" ? "default" : "prescribed"}
                                    className="text-[10px] mb-2"
                                >
                                    {product.timing}
                                </Badge>
                                <h4 className="font-bold text-gray-900">{product.name}</h4>
                                <p className="text-xs text-gray-500">{product.description}</p>
                                <button className="w-full mt-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                    EXPLORE
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
