'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDermoCareStore } from '@/lib/store';
import type { Routine, RoutineProduct } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductInstructionSheet } from './ProductInstructionSheet';
import { SaveTemplateSheet } from './SaveTemplateSheet';
import { LoadTemplateSheet } from './LoadTemplateSheet';
import { Drawer } from '@/components/shared/Drawer';

interface EditRoutineSheetProps {
    routine: Routine;
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

export function EditRoutineSheet({ routine, isOpen, onClose, onSaved }: EditRoutineSheetProps) {
    const { products, removeProductFromRoutine, addProductToRoutine } = useDermoCareStore();

    // Track which products are in the routine
    const [routineProductIds, setRoutineProductIds] = useState<string[]>(
        routine.products.map(p => p.id)
    );

    // Sync state with routine prop updates
    useEffect(() => {
        setRoutineProductIds(routine.products.map(p => p.id));
    }, [routine]);

    // Sub-sheet states
    const [isInstructionSheetOpen, setIsInstructionSheetOpen] = useState(false);
    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
    const [isLoadTemplateOpen, setIsLoadTemplateOpen] = useState(false);
    const [selectedProductForInstructions, setSelectedProductForInstructions] = useState<RoutineProduct | null>(null);

    // Products not currently in the routine
    const availableProducts = useMemo(() => {
        return products.filter(p => !routineProductIds.includes(p.id));
    }, [products, routineProductIds]);

    // Products currently in the routine (mapped with routine data)
    const currentProducts = useMemo(() => {
        // We look for the product properties in the global list, but we also need routine-specific info (instructions)
        // If the product is newly added, it might not be in routine.products yet until parent updates
        return routineProductIds.map(id => {
            const globalProduct = products.find(p => p.id === id);
            const routineProduct = routine.products.find(rp => rp.id === id);

            if (!globalProduct) return null;

            return {
                ...globalProduct,
                ...routineProduct // Merge instruction/status data if available
            };
        }).filter(Boolean) as RoutineProduct[];
    }, [products, routineProductIds, routine.products]);

    const handleRemoveProduct = (productId: string) => {
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
        removeProductFromRoutine(routine.id, productId);
        setRoutineProductIds(prev => prev.filter(id => id !== productId));
    };

    const handleAddProduct = (productId: string) => {
        if (navigator.vibrate) navigator.vibrate(50);
        addProductToRoutine(routine.id, productId);
        setRoutineProductIds(prev => [...prev, productId]);
    };

    const handleOpenInstructions = (product: RoutineProduct) => {
        setSelectedProductForInstructions(product);
        setIsInstructionSheetOpen(true);
    };

    const handleClose = () => {
        onSaved?.();
        onClose();
    };

    if (!isOpen) return null;

    const scheduleLabel = routine.scheduleType === 'am' ? 'Mañana' : 'Noche';
    const scheduleIcon = routine.scheduleType === 'am' ? 'light_mode' : 'dark_mode';
    const scheduleColor = routine.scheduleType === 'am' ? 'text-amber-500 bg-amber-50' : 'text-indigo-500 bg-indigo-50';

    return (
        <>
            <Drawer
                isOpen={isOpen}
                onClose={handleClose}
                // title={undefined} // Implicitly undefined
                className="max-h-[90vh]"
            >
                <div className="pb-32">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', scheduleColor)}>
                                <span className="material-symbols-outlined">{scheduleIcon}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Editar Rutina {scheduleLabel}</h2>
                                <p className="text-xs text-secondary">{currentProducts.length} productos</p>
                            </div>
                        </div>
                    </div>

                    {/* Template Actions */}
                    <div className="flex gap-2 mb-6 overfow-x-auto">
                        <button
                            onClick={() => setIsLoadTemplateOpen(true)}
                            className="flex-1 py-3 px-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center gap-2 text-sm font-semibold text-neutral-700 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-purple-500">upload_file</span>
                            Cargar Plantilla
                        </button>
                        <button
                            onClick={() => setIsSaveTemplateOpen(true)}
                            className="flex-1 py-3 px-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center gap-2 text-sm font-semibold text-neutral-700 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-blue-500">save</span>
                            Guardar como Plantilla
                        </button>
                    </div>

                    {/* Current Products */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                            Productos Actuales
                        </h3>

                        {currentProducts.length === 0 ? (
                            <div className="bg-neutral-50 rounded-2xl p-6 text-center">
                                <span className="material-symbols-outlined text-3xl text-neutral-300 mb-2">spa</span>
                                <p className="text-sm text-neutral-500">Sin productos en esta rutina</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {currentProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white p-4 rounded-2xl border border-neutral-100"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                                product.iconBgColor || "bg-neutral-100"
                                            )}>
                                                <span className="material-symbols-outlined text-lg">
                                                    {product.iconName || 'spa'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-secondary truncate">{product.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveProduct(product.id)}
                                                className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                                            >
                                                <span className="material-symbols-outlined text-lg">remove</span>
                                            </button>
                                        </div>

                                        {/* Instructions & Actions */}
                                        <div className="pl-[52px]">
                                            {product.instructions ? (
                                                <div
                                                    className="bg-orange-50 rounded-xl p-3 mb-2 cursor-pointer border border-orange-100"
                                                    onClick={() => handleOpenInstructions(product)}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="material-symbols-outlined text-orange-500 text-sm">edit_note</span>
                                                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">Instrucciones</span>
                                                    </div>
                                                    <p className="text-xs text-orange-800 leading-relaxed">
                                                        {product.instructions}
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenInstructions(product)}
                                                    className="text-xs font-semibold text-primary flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-primary/5 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">add_notes</span>
                                                    Añadir instrucciones
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Available Products to Add */}
                    {availableProducts.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                                Añadir Productos
                            </h3>
                            <div className="space-y-2">
                                {availableProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-neutral-50 p-4 rounded-2xl flex items-center gap-3"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 opacity-60",
                                            product.iconBgColor || "bg-neutral-100"
                                        )}>
                                            <span className="material-symbols-outlined text-lg">
                                                {product.iconName || 'spa'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate text-neutral-600">{product.name}</p>
                                            <p className="text-xs text-neutral-400 truncate">{product.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddProduct(product.id)}
                                            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Done Button */}
                    <button
                        onClick={handleClose}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-primary shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">check</span>
                        Guardar Cambios
                    </button>
                </div>
            </Drawer>

            {/* Sub Sheets */}
            <ProductInstructionSheet
                isOpen={isInstructionSheetOpen}
                onClose={() => setIsInstructionSheetOpen(false)}
                routineId={routine.id}
                product={selectedProductForInstructions}
            />

            <SaveTemplateSheet
                isOpen={isSaveTemplateOpen}
                onClose={() => setIsSaveTemplateOpen(false)}
                routineId={routine.id}
            />

            <LoadTemplateSheet
                isOpen={isLoadTemplateOpen}
                onClose={() => setIsLoadTemplateOpen(false)}
                routineId={routine.id}
            />
        </>
    );
}
