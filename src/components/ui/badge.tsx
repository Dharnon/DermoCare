import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
    {
        variants: {
            variant: {
                default: "bg-pink-100 text-pink-600",
                confirmed: "bg-emerald-100 text-emerald-600",
                arrived: "bg-teal-100 text-teal-600",
                delayed: "bg-red-100 text-red-500",
                pending: "bg-amber-100 text-amber-600",
                new: "bg-blue-100 text-blue-600",
                critical: "bg-red-100 text-red-600",
                hydration: "bg-blue-100 text-blue-600",
                acne: "bg-pink-100 text-pink-600",
                protection: "bg-amber-100 text-amber-600",
                prescribed: "bg-coral-light text-coral",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
