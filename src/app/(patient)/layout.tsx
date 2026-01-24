import { PatientBottomNav } from '@/components/shared/PatientBottomNav';
import { PageTransition } from '@/components/shared/PageTransition';

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PageTransition>
                <main className="max-w-md mx-auto pb-32">{children}</main>
            </PageTransition>

            <PatientBottomNav />
        </div>
    );
}
