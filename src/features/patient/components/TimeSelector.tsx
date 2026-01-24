"use client";

import { Sun, Moon } from "lucide-react";

interface TimeSelectorProps {
    activeTime: "morning" | "evening";
    onChange: (time: "morning" | "evening") => void;
}

export function TimeSelector({ activeTime, onChange }: TimeSelectorProps) {
    return (
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-8">
            <button
                onClick={() => onChange("morning")}
                className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTime === "morning"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                        : "text-secondary"
                    }`}
            >
                <Sun size={14} />
                Morning
            </button>
            <button
                onClick={() => onChange("evening")}
                className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTime === "evening"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                        : "text-secondary"
                    }`}
            >
                <Moon size={14} />
                Evening
            </button>
        </div>
    );
}
