import { DoctorBottomNav } from '@/components/shared/DoctorBottomNav';
import { PageTransition } from '@/components/shared/PageTransition';

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
            <div className="w-full max-w-md min-h-screen flex flex-col bg-background relative">
                <PageTransition>
                    <main className="flex-1 pb-32">{children}</main>
                </PageTransition>

                <DoctorBottomNav />
            </div>
        </div>
    );
}
