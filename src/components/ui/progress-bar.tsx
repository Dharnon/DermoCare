"use client";

import { cn } from "@/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

interface ProgressBarProps
    extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    value: number;
    label?: string;
    showLabel?: boolean;
}

const ProgressBar = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    ProgressBarProps
>(({ className, value, label, showLabel = true, ...props }, ref) => (
    <div className="w-full">
        {(label || showLabel) && (
            <div className="flex justify-between items-center mb-2">
                {label && (
                    <span className="text-xs font-medium uppercase tracking-wider text-coral">
                        {label}
                    </span>
                )}
                {showLabel && (
                    <span className="text-sm font-semibold text-gray-700">{value}%</span>
                )}
            </div>
        )}
        <ProgressPrimitive.Root
            ref={ref}
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-gray-100",
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className="h-full rounded-full bg-gradient-to-r from-coral-light to-coral transition-all duration-500 ease-out"
                style={{ width: `${value}%` }}
            />
        </ProgressPrimitive.Root>
    </div>
));
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
