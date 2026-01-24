'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Product, RoutineProduct } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface ProductDetailSheetProps {
    product: Product | RoutineProduct;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailSheet({ product, isOpen, onClose }: ProductDetailSheetProps) {
    if (!isOpen) return null;

    // Icon colors based on product category
    const iconColors: Record<string, string> = {
        cleanser: 'text-blue-500',
        serum: 'text-orange-500',
        moisturizer: 'text-pink-500',
        sunscreen: 'text-yellow-500',
        treatment: 'text-purple-500',
        other: 'text-gray-500',
    };

    const categoryLabels: Record<string, string> = {
        cleanser: 'Limpiador',
        serum: 'Sérum',
        moisturizer: 'Hidratante',
        sunscreen: 'Protector Solar',
        treatment: 'Tratamiento',
        other: 'Otro',
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            description={categoryLabels[product.category] || product.category}
            className="max-h-[85vh] min-h-[40vh]"
        >
            <div className="pb-12 pt-4">
                <div className="flex items-start gap-4 mb-6">
                    <div
                        className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0',
                            product.iconBgColor || 'bg-gray-100'
                        )}
                    >
                        <span
                            className={cn(
                                'material-symbols-outlined text-3xl',
                                iconColors[product.category] || 'text-gray-500'
                            )}
                        >
                            {product.iconName || 'spa'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-secondary">{product.description}</p>
                    </div>
                </div>

                {/* Application Instructions */}
                <div className="bg-primary/10 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">
                            info
                        </span>
                        <h3 className="font-bold text-slate-800">Cómo Aplicar</h3>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                        {product.applicationMethod}
                    </p>
                </div>

                {/* Frequency */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-secondary">
                            schedule
                        </span>
                        <h3 className="font-bold text-slate-800">Frecuencia</h3>
                    </div>
                    <p className="text-slate-700">{product.frequency}</p>
                </div>

                {/* Tips (static for now) */}
                <div className="border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-yellow-500">
                            lightbulb
                        </span>
                        <h3 className="font-bold text-slate-800">Consejos</h3>
                    </div>
                    <ul className="text-slate-700 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">
                                check_circle
                            </span>
                            Aplicar sobre piel limpia y seca
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">
                                check_circle
                            </span>
                            Esperar 30 segundos antes del siguiente producto
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">
                                check_circle
                            </span>
                            Consistencia es clave para resultados
                        </li>
                    </ul>
                </div>
            </div>
        </Drawer>
    );
}
