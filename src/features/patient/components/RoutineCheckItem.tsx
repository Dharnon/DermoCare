'use client';

import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { getTodayString } from '@/lib/adherence';
import type { RoutineProduct, ScheduleType } from '@/lib/types';

interface RoutineCheckItemProps {
    product: RoutineProduct;
    routineId: string;
    scheduleType: ScheduleType;
    date?: string;
}

export function RoutineCheckItem({
    product,
    routineId,
    scheduleType,
    date = getTodayString(),
}: RoutineCheckItemProps) {
    const { toggleProductCheck, getProductStatus } = useDermoCareStore();
    const status = getProductStatus(routineId, product.id, scheduleType, date);
    const isChecked = status === 'checked';

    const handleToggle = () => {
        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        toggleProductCheck(routineId, product.id, scheduleType, date);
    };

    // Icon colors based on product category
    const iconColors: Record<string, string> = {
        cleanser: 'text-blue-400',
        serum: 'text-orange-400',
        moisturizer: 'text-pink-400',
        sunscreen: 'text-yellow-500',
        treatment: 'text-purple-400',
        other: 'text-gray-400',
    };

    return (
        <div
            onClick={handleToggle}
            className={cn(
                'bg-white p-5 rounded-[28px] flex items-center gap-4 shadow-sm border border-gray-50',
                'cursor-pointer transition-all duration-200',
                'active:scale-[0.98]',
                isChecked && 'bg-gray-50/80'
            )}
        >
            {/* Product Icon */}
            <div
                className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center',
                    product.iconBgColor || 'bg-gray-100'
                )}
            >
                <span
                    className={cn(
                        'material-symbols-outlined text-2xl',
                        iconColors[product.category] || 'text-gray-400'
                    )}
                >
                    {product.iconName || 'spa'}
                </span>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <h3
                    className={cn(
                        'font-bold text-gray-800 transition-colors',
                        isChecked && 'text-gray-500'
                    )}
                >
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {product.applicationMethod}
                </p>
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
                <div
                    className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300',
                        isChecked
                            ? 'bg-green-500 scale-100'
                            : 'border-2 border-gray-200 scale-100 hover:border-primary'
                    )}
                >
                    {isChecked && (
                        <span className="material-symbols-outlined text-lg font-bold text-white">
                            check
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
