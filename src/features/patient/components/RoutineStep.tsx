"use client";

interface RoutineStepProps {
    stepNumber: number;
    category: string;
    title: string;
    description: string;
    duration?: string;
    isCompleted?: boolean;
    isActive?: boolean;
    isLast?: boolean;
    info?: string;
}

export function RoutineStep({
    stepNumber,
    category,
    title,
    description,
    duration,
    isCompleted = false,
    isActive = false,
    isLast = false,
    info,
}: RoutineStepProps) {
    return (
        <div className={`flex gap-4 ${!isActive && !isCompleted ? "opacity-50" : ""}`}>
            <div className="flex flex-col items-center">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all relative z-10 ${isCompleted
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : isActive
                            ? "bg-white dark:bg-neutral-800 text-primary border-2 border-primary"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-2 border-white dark:border-neutral-900"
                        }`}
                >
                    {stepNumber}
                </div>
                {!isLast && (
                    <div className={`w-0.5 flex-1 my-2 ${isCompleted ? "bg-primary/20" : "bg-neutral-100 dark:bg-neutral-800"}`} />
                )}
            </div>

            <div
                className={`flex-1 bg-white dark:bg-neutral-900/50 p-5 rounded-[2rem] ios-shadow border border-neutral-50 dark:border-neutral-800 transition-all ${isActive ? "border-l-4 border-l-primary/40 ring-1 ring-primary/10" : ""
                    }`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{category}</p>
                        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{title}</h3>
                    </div>
                    {isCompleted ? (
                        <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                    ) : (
                        <button className="w-8 h-8 rounded-full border-2 border-neutral-100 dark:border-neutral-800 hover:border-primary/50 transition-colors" />
                    )}
                </div>
                <p className="text-xs text-secondary leading-relaxed mb-4">{description}</p>

                {(duration || info) && (
                    <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                        {duration ? (
                            <>
                                <span className="material-symbols-outlined text-sm text-secondary">timer</span>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                    Duration: {duration}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm text-secondary">info</span>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                    {info}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
