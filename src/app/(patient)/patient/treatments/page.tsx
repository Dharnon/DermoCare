"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDermoCareStore } from "@/lib/store";
import { calculateWeeklyAdherence } from "@/lib/adherence";
import { cn } from "@/lib/utils";
import { ProductDetailSheet } from "@/features/patient/components/ProductDetailSheet";
import type { Product } from "@/lib/types";

export default function TreatmentsPage() {
    const {
        currentPatient,
        currentPro,
        getPatientRoutine,
        adherenceLogs,
    } = useDermoCareStore();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const amRoutine = getPatientRoutine('am');
    const pmRoutine = getPatientRoutine('pm');

    // Calculate adherence for active treatment
    const weeklyAdherence = useMemo(() => {
        if (!amRoutine) return 0;
        return calculateWeeklyAdherence(adherenceLogs, amRoutine);
    }, [amRoutine, adherenceLogs]);

    // Calculate treatment day (days since routine was created)
    const treatmentDay = useMemo(() => {
        if (!amRoutine) return 0;
        const createdAt = new Date(amRoutine.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [amRoutine]);

    // Calculate total products
    const totalProducts = useMemo(() => {
        const amProducts = amRoutine?.products.length || 0;
        const pmProducts = pmRoutine?.products.length || 0;
        // Count unique products
        const uniqueProducts = new Set([
            ...(amRoutine?.products.map(p => p.id) || []),
            ...(pmRoutine?.products.map(p => p.id) || []),
        ]);
        return uniqueProducts.size;
    }, [amRoutine, pmRoutine]);

    const hasActiveRoutine = amRoutine || pmRoutine;

    return (
        <div className="min-h-screen pb-32">
            {/* Product Detail Sheet */}
            {selectedProduct && (
                <ProductDetailSheet
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {/* Header */}
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Mis Tratamientos</h1>
                <p className="text-secondary text-sm font-medium mt-1">Tu plan de cuidado personalizado</p>
            </header>

            {/* Active Treatment */}
            {hasActiveRoutine && (
                <section className="px-6 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">medication</span>
                        Tratamiento Activo
                    </h2>

                    <div className="block bg-white p-5 rounded-[2rem] ios-shadow border border-neutral-50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Rutina Personalizada</h3>
                                <p className="text-xs text-secondary mt-1">
                                    Prescrita por {currentPro?.name || 'tu dermatólogo'}
                                </p>
                            </div>
                            <span className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                Activo
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-secondary">Día {treatmentDay} de tratamiento</span>
                                <span className="font-bold">{weeklyAdherence}% adherencia</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${weeklyAdherence}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-4 pt-4 border-t border-neutral-100">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">spa</span>
                                <span className="text-xs font-bold">{totalProducts} Productos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                <span className="text-xs font-bold">{weeklyAdherence}% Semanal</span>
                            </div>
                        </div>

                        {/* Link to routine */}
                        <Link
                            href="/patient/routine"
                            className="mt-4 w-full bg-primary/10 text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                        >
                            <span className="material-symbols-outlined text-lg">checklist</span>
                            Ver Mi Rutina
                        </Link>
                    </div>
                </section>
            )}

            {/* My Products */}
            <section className="px-6 mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">spa</span>
                    Mis Productos
                </h2>

                {!hasActiveRoutine ? (
                    <div className="bg-neutral-50 rounded-[2rem] p-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-neutral-300 mb-4">spa</span>
                        <p className="font-bold text-neutral-600 mb-1">Sin productos asignados</p>
                        <p className="text-sm text-neutral-400">Tu dermatólogo te asignará una rutina pronto</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* AM Products */}
                        {amRoutine && amRoutine.products.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">light_mode</span>
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Rutina Mañana</span>
                                </div>
                                <div className="space-y-2">
                                    {amRoutine.products.map((product) => (
                                        <button
                                            key={`am-${product.id}`}
                                            onClick={() => setSelectedProduct(product)}
                                            className="w-full bg-white p-4 rounded-2xl ios-shadow border border-neutral-50 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                product.iconBgColor || "bg-neutral-100"
                                            )}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {product.iconName || 'spa'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-secondary truncate">{product.description}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-neutral-300">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PM Products */}
                        {pmRoutine && pmRoutine.products.length > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="material-symbols-outlined text-indigo-500 text-sm">dark_mode</span>
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Rutina Noche</span>
                                </div>
                                <div className="space-y-2">
                                    {pmRoutine.products.map((product) => (
                                        <button
                                            key={`pm-${product.id}`}
                                            onClick={() => setSelectedProduct(product)}
                                            className="w-full bg-white p-4 rounded-2xl ios-shadow border border-neutral-50 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                product.iconBgColor || "bg-neutral-100"
                                            )}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {product.iconName || 'spa'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-secondary truncate">{product.description}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-neutral-300">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Tips Section */}
            <section className="px-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-[2rem] border border-amber-100">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                        <div>
                            <h3 className="font-bold text-sm text-amber-800 mb-1">Consejo del día</h3>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Aplica tus productos en orden, de más ligero a más denso. Espera 30 segundos entre cada uno para mejor absorción.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
