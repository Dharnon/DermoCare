'use client';

import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

interface AdherenceBarProps {
    percentage: number;
    riskLevel: RiskLevel;
    showLabel?: boolean;
    className?: string;
}

export function AdherenceBar({
    percentage,
    riskLevel,
    showLabel = true,
    className,
}: AdherenceBarProps) {
    const getBarColor = () => {
        switch (riskLevel) {
            case 'on-track':
                return 'bg-green-500';
            case 'at-risk':
                return 'bg-yellow-500';
            case 'critical':
                return 'bg-red-500';
        }
    };

    const getTextColor = () => {
        switch (riskLevel) {
            case 'on-track':
                return 'text-green-600';
            case 'at-risk':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
        }
    };

    return (
        <div className={cn('w-full', className)}>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        getBarColor()
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between items-center mt-1">
                    <span className={cn('text-xs font-bold', getTextColor())}>
                        {percentage}% adherencia
                    </span>
                    <span className="text-[10px] text-secondary uppercase tracking-wider">
                        {riskLevel === 'on-track' && 'En buen camino'}
                        {riskLevel === 'at-risk' && 'En riesgo'}
                        {riskLevel === 'critical' && 'Crítico'}
                    </span>
                </div>
            )}
        </div>
    );
}
