'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('animate-pulse bg-neutral-200 rounded-lg', className)} />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen pb-24 px-6 pt-12 space-y-8">
            {/* Header skeleton */}
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-40" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="w-12 h-12 rounded-full" />
                </div>
            </div>

            {/* Progress card skeleton */}
            <div className="bg-primary rounded-[2.5rem] p-6">
                <div className="flex items-center gap-6">
                    <Skeleton className="w-[100px] h-[100px] rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>

            {/* Quick actions skeleton */}
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-[2rem]" />
                <Skeleton className="h-24 rounded-[2rem]" />
            </div>

            {/* Routine skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-20 rounded-[2rem]" />
                <Skeleton className="h-20 rounded-[2rem]" />
            </div>

            {/* Doctor info skeleton */}
            <Skeleton className="h-20 rounded-[2rem]" />
        </div>
    );
}

export function RoutineSkeleton() {
    return (
        <div className="min-h-screen pb-24 px-6 pt-12 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-[2rem]" />
                ))}
            </div>
        </div>
    );
}

export function PatientListSkeleton() {
    return (
        <div className="min-h-screen pb-24 px-6 pt-12 space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-[2rem]" />
                ))}
            </div>
        </div>
    );
}
