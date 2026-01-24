'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
    className?: string;
    trackColor?: string;
    progressColor?: string;
    labelColor?: string;
}

export function CircularProgress({
    value,
    size = 80,
    strokeWidth = 8,
    showLabel = true,
    className,
    trackColor = 'stroke-white/30',
    progressColor = 'stroke-white',
    labelColor = 'text-white',
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    className={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    className={cn(progressColor, 'transition-all duration-500 ease-out')}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            {showLabel && (
                <span className={cn('absolute text-lg font-bold', labelColor)}>
                    {Math.round(value)}%
                </span>
            )}
        </div>
    );
}
