import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    icon: string; // Material Symbol name
    value: string | number;
    label: string;
    iconBgColor?: string;
    iconColor?: string;
    className?: string;
}

export function StatsCard({
    icon,
    value,
    label,
    iconBgColor = "bg-[#F8C6B9]/20",
    iconColor = "text-[#F8C6B9]",
    className,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                "bg-white rounded-3xl p-5 ios-shadow flex flex-col items-center justify-center text-center min-h-[140px]",
                className
            )}
        >
            <div
                className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-3",
                    iconBgColor
                )}
            >
                <span className={cn("material-symbols-outlined text-2xl", iconColor)}>
                    {icon}
                </span>
            </div>
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A869A] mt-1">
                {label}
            </span>
        </div>
    );
}
