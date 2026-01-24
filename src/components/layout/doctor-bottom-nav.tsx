"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/doctor/dashboard", icon: "dashboard", label: "DASH" },
    { href: "/doctor/patients", icon: "group", label: "PATIENTS" },
    { href: "/doctor/dashboard", icon: "person_add", label: "", isAction: true },
    { href: "/doctor/schedule", icon: "calendar_today", label: "SCHEDULE" },
    { href: "/doctor/tools", icon: "settings", label: "TOOLS" },
];

export function DoctorBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-4 pb-8">
            <div className="max-w-md mx-auto flex justify-between items-center">
                {navItems.map((item, index) => {
                    const isActive = pathname.startsWith(item.href);

                    if (item.isAction) {
                        return (
                            <div key="action" className="-mt-12">
                                <Link
                                    href="/doctor/patients/new"
                                    className="w-14 h-14 bg-[#F8C6B9] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#F8C6B9]/40 transform active:scale-95 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-3xl">
                                        {item.icon}
                                    </span>
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href + index}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                isActive
                                    ? "text-[#F8C6B9]"
                                    : "text-slate-400 hover:text-[#F8C6B9]"
                            )}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
