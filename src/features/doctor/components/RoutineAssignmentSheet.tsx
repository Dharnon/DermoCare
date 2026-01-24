'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import type { Product, ScheduleType } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface RoutineAssignmentSheetProps {
    patientId: string;
    patientName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function RoutineAssignmentSheet({
    patientId,
    patientName,
    isOpen,
    onClose,
    onSuccess,
}: RoutineAssignmentSheetProps) {
    const { products, assignRoutineToPatient, getRoutinesByPatient } = useDermoCareStore();
    const existingRoutines = getRoutinesByPatient(patientId);

    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [scheduleType, setScheduleType] = useState<ScheduleType>('am');
    const [isSubmitting, setIsSubmitting] = useState(false);



    if (!isOpen) return null;

    const toggleProduct = (productId: string) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSubmit = () => {
        if (selectedProducts.length === 0) return;

        setIsSubmitting(true);
        assignRoutineToPatient(patientId, selectedProducts, scheduleType);
        setIsSubmitting(false);
        setSelectedProducts([]);

        if (onSuccess) onSuccess();
        onClose();
    };

    const hasExistingRoutine = existingRoutines.some(r => r.scheduleType === scheduleType);

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            className="max-h-[85vh]"
        >
            <div className="pb-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Asignar Rutina</h2>
                        <p className="text-sm text-secondary">Para {patientName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-lg text-gray-600">
                            close
                        </span>
                    </button>
                </div>

                {/* Schedule Type Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Horario
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setScheduleType('am')}
                            className={cn(
                                'flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all',
                                scheduleType === 'am'
                                    ? 'bg-white shadow text-slate-900'
                                    : 'text-secondary'
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">wb_sunny</span>
                            Mañana
                        </button>
                        <button
                            onClick={() => setScheduleType('pm')}
                            className={cn(
                                'flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all',
                                scheduleType === 'pm'
                                    ? 'bg-white shadow text-slate-900'
                                    : 'text-secondary'
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">nightlight_round</span>
                            Noche
                        </button>
                    </div>
                    {hasExistingRoutine && (
                        <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Ya existe una rutina para este horario. Se reemplazará.
                        </p>
                    )}
                </div>

                {/* Product Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Seleccionar Productos ({selectedProducts.length})
                    </label>
                    <div className="space-y-3 max-h-[40vh] overflow-auto">
                        {products.map((product) => {
                            const isSelected = selectedProducts.includes(product.id);
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProduct(product.id)}
                                    className={cn(
                                        'p-4 rounded-2xl border-2 cursor-pointer transition-all',
                                        'flex items-center gap-4',
                                        isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-100 hover:border-gray-200'
                                    )}
                                >
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'w-12 h-12 rounded-xl flex items-center justify-center',
                                            product.iconBgColor || 'bg-gray-100'
                                        )}
                                    >
                                        <span className="material-symbols-outlined text-xl text-primary">
                                            {product.iconName || 'spa'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-800">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-secondary truncate">
                                            {product.frequency}
                                        </p>
                                    </div>

                                    {/* Checkbox */}
                                    <div
                                        className={cn(
                                            'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                                            isSelected
                                                ? 'bg-primary'
                                                : 'border-2 border-gray-200'
                                        )}
                                    >
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-sm text-white">
                                                check
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedProducts.length === 0}
                    className={cn(
                        'w-full py-4 rounded-2xl font-bold text-white',
                        'bg-primary hover:bg-primary/90',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'active:scale-[0.98] transition-all'
                    )}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin">
                                progress_activity
                            </span>
                            Asignando...
                        </span>
                    ) : (
                        `Asignar ${selectedProducts.length} Producto${selectedProducts.length !== 1 ? 's' : ''}`
                    )}
                </button>
            </div>
        </Drawer>
    );
}
