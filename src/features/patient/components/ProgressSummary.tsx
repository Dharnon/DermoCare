interface ProgressSummaryProps {
    adherence: number;
    currentDay: number;
    totalDays: number;
    photoCount: number;
    statusText: string;
}

export function ProgressSummary({
    adherence,
    currentDay,
    totalDays,
    photoCount,
    statusText,
}: ProgressSummaryProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 ios-shadow mb-8">
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm font-bold">Treatment Adherence</p>
                <p className="text-primary font-bold">{adherence}%</p>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-8">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${adherence}%` }}
                />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Day</p>
                    <p className="text-xl font-bold">{currentDay}/{totalDays}</p>
                </div>
                <div className="border-x border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Photos</p>
                    <p className="text-xl font-bold">{photoCount < 10 ? `0${photoCount}` : photoCount}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 py-1.5 px-2 rounded-lg mt-0.5 inline-block">
                        {statusText}
                    </p>
                </div>
            </div>
        </div>
    );
}
