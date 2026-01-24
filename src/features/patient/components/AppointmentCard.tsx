import { CalendarDays } from "lucide-react";

interface AppointmentCardProps {
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    imageUrl: string;
}

export function AppointmentCard({ doctorName, specialty, date, time, imageUrl }: AppointmentCardProps) {
    return (
        <section className="mb-8">
            <h3 className="text-lg font-bold mb-4 px-1">Upcoming Consultation</h3>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl ios-shadow flex items-center gap-4 border border-neutral-50 dark:border-neutral-700">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img src={imageUrl} alt={doctorName} className="w-full h-full object-cover rounded-2xl" />
                </div>
                <div className="flex-1">
                    <p className="font-bold">{doctorName}</p>
                    <p className="text-xs text-secondary italic">{specialty}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-primary">{date}</p>
                    <p className="text-[10px] text-secondary">{time}</p>
                </div>
            </div>
        </section>
    );
}
