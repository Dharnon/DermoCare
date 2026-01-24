import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-medium hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]",
                secondary:
                    "bg-white text-gray-700 shadow-soft border border-gray-100 hover:bg-gray-50",
                outline:
                    "border-2 border-pink-400 text-pink-500 bg-transparent hover:bg-pink-50",
                ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                coral:
                    "bg-gradient-to-r from-coral to-orange-400 text-white shadow-medium hover:shadow-elevated",
            },
            size: {
                sm: "h-9 px-4 text-sm rounded-xl",
                default: "h-12 px-6 text-base rounded-2xl",
                lg: "h-14 px-8 text-lg rounded-2xl",
                icon: "h-12 w-12 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
