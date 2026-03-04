'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useDermoCareStore } from '@/lib/store';
import { calculateWeeklyAdherence, getAdherenceRiskLevel } from '@/lib/adherence';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ProgressPage() {
    const {
        currentPatient,
        getPatientRoutine,
        adherenceLogs,
        progressEntries,
        fetchProgressEntries,
        addProgressEntry,
        updateProgressEntry
    } = useDermoCareStore();

    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [sliderPosition, setSliderPosition] = useState(50);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        if (currentPatient) {
            fetchProgressEntries(currentPatient.id);
        }
    }, [currentPatient, fetchProgressEntries]);

    // Derived Stats
    const amRoutine = getPatientRoutine('am');
    const weeklyAdherence = useMemo(() => {
        if (!amRoutine) return 0;
        return calculateWeeklyAdherence(adherenceLogs, amRoutine);
    }, [amRoutine, adherenceLogs]);

    const riskLevel = getAdherenceRiskLevel(weeklyAdherence);

    // Calculate treatment duration
    const treatmentDay = useMemo(() => {
        if (!amRoutine?.createdAt) return 1;
        const startDate = new Date(amRoutine.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [amRoutine]);

    // Comparison Logic
    const sortedEntries = useMemo(() => {
        return [...progressEntries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [progressEntries]);

    const beforePhoto = sortedEntries.length > 0 ? sortedEntries[0] : null;
    const afterPhoto = sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1] : null;

    // File Upload Handler
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentPatient) return;

        try {
            setIsUploading(true);
            const fileName = `${currentPatient.id}/${Date.now()}-${file.name}`;

            // Try to upload to Supabase Storage
            let photoUrl: string;

            try {
                const { error } = await supabase.storage
                    .from('progress-photos')
                    .upload(fileName, file);

                if (error) throw error;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('progress-photos')
                    .getPublicUrl(fileName);

                photoUrl = publicUrl;
            } catch {
                // Fallback: Use local object URL for demo (won't persist across sessions)
                console.warn('Storage upload failed, using local fallback');
                photoUrl = URL.createObjectURL(file);
            }

            // Save to DB/Store
            await addProgressEntry({
                patientId: currentPatient.id,
                photoUrl,
                notes: 'Progreso diario'
            });

        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="px-6 pb-32 min-h-screen bg-background relative overflow-hidden">
            {/* Decorative blurs matching dashboard */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute top-1/2 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl -z-10" />

            {/* Header */}
            <header className="pt-12 pb-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/patient/dashboard"
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center ios-shadow border border-neutral-50 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                            arrow_back_ios_new
                        </span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Mi Progreso
                        </h1>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">
                            Día {treatmentDay} del Tratamiento
                        </p>
                    </div>
                </div>

                {/* Upload Button (Header Action) */}
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-12 h-12 rounded-full bg-white ios-shadow border border-neutral-50 flex items-center justify-center active:scale-95 transition-all text-slate-400 hover:text-primary"
                    >
                        {isUploading ? (
                            <span className="material-symbols-outlined animate-spin text-xl text-primary">refresh</span>
                        ) : (
                            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                        )}
                    </button>
                </div>
            </header>

            {/* Before/After Comparison Slider */}
            {beforePhoto && afterPhoto && beforePhoto.id !== afterPhoto.id && (
                <section className="relative z-10 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary text-xs font-bold uppercase tracking-widest">Tu Evolución</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">Día 1</span>
                            <div className="w-8 h-0.5 bg-gradient-to-r from-slate-300 to-primary rounded-full"></div>
                            <span className="text-[10px] text-primary font-bold">Hoy</span>
                        </div>
                    </div>

                    <div
                        ref={sliderRef}
                        className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden ios-shadow border border-neutral-100 cursor-ew-resize select-none"
                        onMouseDown={(e) => {
                            const rect = sliderRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            const handleMove = (moveEvent: MouseEvent) => {
                                const x = moveEvent.clientX - rect.left;
                                const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
                                setSliderPosition(percent);
                            };
                            const handleUp = () => {
                                document.removeEventListener('mousemove', handleMove);
                                document.removeEventListener('mouseup', handleUp);
                            };
                            document.addEventListener('mousemove', handleMove);
                            document.addEventListener('mouseup', handleUp);
                            handleMove(e.nativeEvent);
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            const rect = sliderRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            const touch = e.touches[0];
                            const x = touch.clientX - rect.left;
                            const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
                            setSliderPosition(percent);
                        }}
                        onTouchMove={(e) => {
                            e.preventDefault();
                            const rect = sliderRef.current?.getBoundingClientRect();
                            if (!rect) return;
                            const touch = e.touches[0];
                            const x = touch.clientX - rect.left;
                            const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
                            setSliderPosition(percent);
                        }}
                    >
                        {/* After Photo (Right side - "Hoy") */}
                        <img
                            src={afterPhoto.photoUrl}
                            alt="Después"
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute bottom-4 right-4 bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg z-20">
                            Hoy
                        </div>

                        {/* Before Photo (Left side - "Día 1") - uses clip-path */}
                        <div
                            className="absolute inset-0"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                            <img
                                src={beforePhoto.photoUrl}
                                alt="Antes"
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                            />
                            <div className="absolute bottom-4 left-4 bg-slate-800 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                Día 1
                            </div>
                        </div>

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white z-30"
                            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                        >
                            {/* Handle Circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl border-2 border-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">compare_arrows</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-3">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">swipe</span>
                        Desliza para comparar
                    </p>
                </section>
            )}

            {/* Key Stats Grid */}
            <section className="relative z-10 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    {/* Adherence Card */}
                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 ios-shadow flex flex-col justify-between min-h-[110px]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full text-lg">pie_chart</span>
                        </div>
                        <div>
                            <p className="font-black text-3xl text-slate-800">{weeklyAdherence}%</p>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wide">Adherencia</p>
                        </div>
                    </div>

                    {/* Photos Count Card */}
                    <div className="bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 ios-shadow flex flex-col justify-between min-h-[110px]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full text-lg">photo_library</span>
                        </div>
                        <div>
                            <p className="font-black text-3xl text-slate-800">{sortedEntries.length}</p>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wide">Fotos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-secondary text-xs font-bold uppercase tracking-widest">Mi Historia</h3>
                <div className="flex items-center gap-1 bg-peach-light px-3 py-1 rounded-full border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    <span className="text-accent text-[10px] font-bold uppercase tracking-wider">{sortedEntries.length} Fotos</span>
                </div>
            </div>

            {/* Main Timeline */}
            <div className="relative pl-4 space-y-10 z-10">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-0 w-0.5 bg-neutral-100"></div>



                {/* Entries (Newest First) */}
                {sortedEntries.length > 0 ? (
                    sortedEntries.slice().reverse().map((entry, index) => (
                        <div key={entry.id} className="relative pl-10 animate-in" style={{ animationDelay: `${index * 80}ms` }}>
                            {/* Dot */}
                            <div className={cn(
                                "absolute left-[14px] top-6 w-3 h-3 rounded-full border-2 border-background shadow-md z-10 transition-colors",
                                index === 0 ? "bg-primary" : "bg-neutral-200"
                            )}></div>

                            <div className="card rounded-[2rem] p-6 relative overflow-hidden page-transition">
                                {/* Date Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                                        {new Date(entry.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    {index === 0 && (
                                        <span className="bg-primary/10 text-primary text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            Actual
                                        </span>
                                    )}
                                </div>

                                {/* Photo Container */}
                                <div className="aspect-[4/3] w-full bg-neutral-50 rounded-2xl overflow-hidden mb-5 border border-neutral-100 shadow-inner group relative">
                                    <img src={entry.photoUrl} alt="Progreso" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Notes - Editable */}
                                {editingId === entry.id ? (
                                    <div className="mb-4">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-primary/30 bg-white text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            rows={3}
                                            placeholder="Añade una nota sobre tu progreso..."
                                            autoFocus
                                        />
                                        <div className="flex gap-2 mt-2 justify-end">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await updateProgressEntry(entry.id, editText);
                                                    setEditingId(null);
                                                }}
                                                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-all ios-shadow"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 mb-4">
                                        <p className="text-neutral-600 text-sm leading-relaxed font-medium italic flex-1">
                                            &quot;{entry.notes || 'Progreso registrado hoy.'}&quot;
                                        </p>
                                        <button
                                            onClick={() => {
                                                setEditingId(entry.id);
                                                setEditText(entry.notes || '');
                                            }}
                                            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-neutral-500 text-base">edit</span>
                                        </button>
                                    </div>
                                )}

                                {/* Doctor Feedback - Branded */}
                                {entry.professionalFeedback && (
                                    <div className="bg-peach-light rounded-2xl p-4 mt-4 border border-primary/10 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <span className="material-symbols-outlined text-primary text-xs">medical_services</span>
                                            </div>
                                            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Feedback del Especialista</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-700 leading-relaxed bg-white/40 p-3 rounded-xl">
                                            {entry.professionalFeedback}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 pl-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-neutral-100 mb-4">
                            <span className="material-symbols-outlined text-neutral-300 text-3xl">history_edu</span>
                        </div>
                        <p className="text-base font-bold text-slate-800">Tu historia comienza hoy</p>
                        <p className="text-xs text-secondary mt-2 max-w-[200px] mx-auto leading-relaxed">Sube tu primera foto para empezar el seguimiento personalizado.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
