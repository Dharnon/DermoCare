// DermoCare Adherence Calculation Utilities

import type { LogAdherence, Routine, RiskLevel, ScheduleType } from './types';

/**
 * Calculate adherence percentage for a specific date range
 */
export function calculateAdherence(
    logs: LogAdherence[],
    routine: Routine,
    startDate: Date,
    endDate: Date
): number {
    const relevantLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return (
            log.routineId === routine.id &&
            logDate >= startDate &&
            logDate <= endDate
        );
    });

    const totalExpected = routine.products.length * getDaysBetween(startDate, endDate);
    if (totalExpected === 0) return 0;

    const completed = relevantLogs.filter(log => log.status === 'checked').length;
    return Math.round((completed / totalExpected) * 100);
}

/**
 * Calculate weekly adherence (last 7 days)
 */
export function calculateWeeklyAdherence(
    logs: LogAdherence[],
    routine: Routine
): number {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

    return calculateAdherence(logs, routine, startDate, endDate);
}

/**
 * Calculate daily adherence for a specific date
 */
export function calculateDailyAdherence(
    logs: LogAdherence[],
    routine: Routine,
    date: string,
    scheduleType: ScheduleType
): { completed: number; total: number; percentage: number } {
    const relevantProducts = routine.products;
    const total = relevantProducts.length;

    const completed = logs.filter(
        log =>
            log.routineId === routine.id &&
            log.date === date &&
            log.scheduleType === scheduleType &&
            log.status === 'checked'
    ).length;

    return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
}

/**
 * Determine risk level based on adherence percentage
 */
export function getAdherenceRiskLevel(percentage: number): RiskLevel {
    if (percentage >= 75) return 'on-track';
    if (percentage >= 50) return 'at-risk';
    return 'critical';
}

/**
 * Get color class for risk level
 */
export function getRiskLevelColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
        case 'on-track':
            return 'text-green-500';
        case 'at-risk':
            return 'text-yellow-500';
        case 'critical':
            return 'text-red-500';
    }
}

/**
 * Get background color class for risk level
 */
export function getRiskLevelBgColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
        case 'on-track':
            return 'bg-green-500';
        case 'at-risk':
            return 'bg-yellow-500';
        case 'critical':
            return 'bg-red-500';
    }
}

/**
 * Calculate streak (consecutive days with 100% adherence)
 */
export function calculateStreak(logs: LogAdherence[], routine: Routine): number {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = formatDate(checkDate);

        const dayLogs = logs.filter(
            log => log.routineId === routine.id && log.date === dateStr
        );

        const expectedChecks = routine.products.length;
        const actualChecks = dayLogs.filter(log => log.status === 'checked').length;

        if (actualChecks === expectedChecks && expectedChecks > 0) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Helper functions
function getDaysBetween(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getTodayString(): string {
    return formatDate(new Date());
}
