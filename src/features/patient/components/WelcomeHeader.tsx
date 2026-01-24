import Image from "next/image";

interface DashboardHeaderProps {
    name: string;
    subtext: string;
    avatarUrl: string;
}

export function WelcomeHeader({ name, subtext, avatarUrl }: DashboardHeaderProps) {
    return (
        <header className="mt-6 mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hello, {name}</h1>
                <p className="text-secondary font-medium italic">{subtext}</p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
        </header>
    );
}
