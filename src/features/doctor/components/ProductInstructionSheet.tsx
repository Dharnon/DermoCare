'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import type { RoutineProduct } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface ProductInstructionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    routineId: string;
    product: RoutineProduct | null;
}

export function ProductInstructionSheet({ isOpen, onClose, routineId, product }: ProductInstructionSheetProps) {
    const [instructions, setInstructions] = useState('');
    const { updateProductInstructions } = useDermoCareStore();

    useEffect(() => {
        if (isOpen && product) {
            setInstructions(product.instructions || '');
        }
    }, [isOpen, product]);

    const handleSave = () => {
        if (product) {
            updateProductInstructions(routineId, product.id, instructions);
            onClose();
        }
    };

    if (!isOpen || !product) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            description="Instrucciones personalizadas"
        >
            <div className="pb-12 pt-4">
                <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        product.iconBgColor || 'bg-neutral-100'
                    )}>
                        <span className="material-symbols-outlined text-gray-600">
                            {product.iconName || 'medication'}
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                        Instrucciones
                    </label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Ej: Aplicar 2 gotas en la zona afectada..."
                        className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl font-bold border border-neutral-200 text-neutral-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
