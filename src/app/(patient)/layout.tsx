import { PatientBottomNav } from '@/components/shared/PatientBottomNav';
import { PageTransition } from '@/components/shared/PageTransition';
import { requireAuthenticatedProfile } from '@/lib/auth-server';

export default async function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAuthenticatedProfile('patient');

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
            <div className="w-full max-w-md min-h-screen flex flex-col bg-background relative">
                <PageTransition>
                    <main className="flex-1 pb-32">{children}</main>
                </PageTransition>

                <PatientBottomNav />
            </div>
        </div>
    );
}
