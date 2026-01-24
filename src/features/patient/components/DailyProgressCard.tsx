import { Camera } from "lucide-react";

interface DailyProgressCardProps {
    routineName: string;
    dayCount: string;
    timeRange: string;
}

export function DailyProgressCard({ routineName, dayCount, timeRange }: DailyProgressCardProps) {
    return (
        <div className="bg-primary/20 p-6 rounded-[2rem] border border-primary/30 mb-8 overflow-hidden relative">
            <div className="relative z-10">
                <h2 className="text-lg font-bold mb-1">{routineName}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{dayCount}</p>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                        Check-in Now
                    </button>
                    <span className="text-xs font-bold text-primary">{timeRange}</span>
                </div>
            </div>
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-9xl text-primary/10 rotate-12">
                spa
            </span>
        </div>
    );
}
