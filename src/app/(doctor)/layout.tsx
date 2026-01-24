import { DoctorBottomNav } from '@/components/shared/DoctorBottomNav';
import { PageTransition } from '@/components/shared/PageTransition';

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PageTransition>
                <main className="max-w-md mx-auto pb-32">{children}</main>
            </PageTransition>

            <DoctorBottomNav />
        </div>
    );
}
