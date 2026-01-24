interface StatCardProps {
    icon: string;
    value: string;
    label: string;
    iconColor?: string;
}

export function StatCard({ icon, value, label, iconColor = "text-primary" }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-neutral-800/20 p-5 rounded-[2rem] ios-shadow border border-neutral-50 dark:border-neutral-800">
            <span className={`material-symbols-outlined ${iconColor} mb-3 text-3xl`}>
                {icon}
            </span>
            <p className="text-2xl font-black text-neutral-800 dark:text-neutral-100">{value}</p>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{label}</p>
        </div>
    );
}
