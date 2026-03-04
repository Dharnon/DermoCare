'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { AdherenceBar } from '@/features/doctor/components/AdherenceBar';
import { RoutineAssignmentSheet } from '@/features/doctor/components/RoutineAssignmentSheet';
import { EditRoutineSheet } from '@/features/doctor/components/EditRoutineSheet';
import { DoctorChatSheet } from '@/features/doctor/components/DoctorChatSheet';
import { EditPatientSheet } from '@/features/doctor/components/EditPatientSheet';
import { calculateWeeklyAdherence, getAdherenceRiskLevel } from '@/lib/adherence';
import { useAuth } from '@/context/AuthContext';
import type { Routine, VisitType } from '@/lib/types';

const tabs = ['Rutina', 'Historial', 'Progreso'] as const;
type TabType = (typeof tabs)[number];

export default function PatientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<TabType>('Rutina');
    const [showAssignSheet, setShowAssignSheet] = useState(false);
    const [showChatSheet, setShowChatSheet] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [newNote, setNewNote] = useState('');
    const [consultationType, setConsultationType] = useState<VisitType>('follow-up');
    const [consultationPhotos, setConsultationPhotos] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [feedbackEntryId, setFeedbackEntryId] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    const { setFab, hideFab } = useUIStore();

    const {
        getPatientById,
        getRoutinesByPatient,
        adherenceLogs,
        addClinicalNote,
        getClinicalNotes,
        currentPro,
        progressEntries,
        fetchProgressEntries,
        addProfessionalFeedback,
    } = useDermoCareStore();

    const { profile } = useAuth();

    // Sync Auth Data & Fetch Real Data
    // Note: setSessionUser is now called in AuthContext fetchProfile

    useEffect(() => {
        if (activeTab === 'Historial') {
            setFab(() => {
                const input = document.getElementById('note-input');
                if (input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => (input as HTMLTextAreaElement).focus(), 300);
                }
            }, 'add');
        } else {
            setFab(() => setShowChatSheet(true), 'chat');
        }
        return () => hideFab();
    }, [activeTab, setFab, hideFab]);

    useEffect(() => {
        if (id) {
            fetchProgressEntries(id);
        }
    }, [id, fetchProgressEntries]);

    const patient = getPatientById(id);
    const routines = getRoutinesByPatient(id);
    const notes = getClinicalNotes(id);

    const amRoutine = routines.find((r) => r.scheduleType === 'am');
    const pmRoutine = routines.find((r) => r.scheduleType === 'pm');
    const adherence = amRoutine
        ? calculateWeeklyAdherence(adherenceLogs, amRoutine)
        : 0;
    const riskLevel = getAdherenceRiskLevel(adherence);

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300">
                        person_off
                    </span>
                    <p className="text-secondary mt-4">Paciente no encontrado</p>
                    <Link
                        href="/doctor/patients"
                        className="text-primary font-bold mt-2 inline-block"
                    >
                        Volver a pacientes
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddNote = () => {
        if ((!newNote.trim() && consultationPhotos.length === 0) || !currentPro) return;

        addClinicalNote({
            patientId: patient.id,
            proId: currentPro.id,
            content: newNote.trim(),
            type: consultationType,
            photos: consultationPhotos,
            isPrivate: false,
        });
        setNewNote('');
        setConsultationPhotos([]);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setTimeout(() => {
            const fakeUrl = URL.createObjectURL(file);
            setConsultationPhotos(prev => [...prev, fakeUrl]);
            setIsUploading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="px-6 pt-8 pb-4 flex justify-between items-center">
                <Link
                    href="/doctor/patients"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center ios-shadow border border-neutral-50"
                >
                    <span className="material-symbols-outlined text-neutral-600">
                        arrow_back_ios_new
                    </span>
                </Link>
                <div className="text-center flex-1">
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">Historial Clínico</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paciente: {patient.name}</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center ios-shadow border border-neutral-50">
                    <span className="material-symbols-outlined text-neutral-600">
                        download
                    </span>
                </button>
            </header>

            <section className="px-6 mb-6">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white ios-shadow bg-primary/20 flex items-center justify-center">
                            {patient.avatarUrl ? (
                                <img
                                    alt={patient.name}
                                    className="w-full h-full object-cover"
                                    src={patient.avatarUrl}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-primary">
                                    person
                                </span>
                            )}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                        {patient.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <p className="text-secondary text-sm font-medium">
                            {patient.contactInfo?.email}
                        </p>
                        <button
                            onClick={() => setShowEditSheet(true)}
                            className="p-1 rounded-full hover:bg-neutral-100"
                        >
                            <span className="material-symbols-outlined text-neutral-400 text-sm">edit</span>
                        </button>
                    </div>

                    <div className="w-full max-w-xs mb-4">
                        <AdherenceBar
                            percentage={adherence}
                            riskLevel={riskLevel}
                        />
                    </div>

                    <div className="flex gap-3 w-full max-w-sm">
                        <button className="flex-1 bg-white py-3 rounded-2xl ios-shadow border border-neutral-50 flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-primary">
                                call
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                                Llamar
                            </span>
                        </button>
                        <button className="flex-1 bg-white py-3 rounded-2xl ios-shadow border border-neutral-50 flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-primary">
                                mail
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                                Email
                            </span>
                        </button>
                        <button
                            onClick={() => setShowAssignSheet(true)}
                            className="flex-1 bg-primary py-3 rounded-2xl shadow-lg shadow-primary/20 flex flex-col items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-white">
                                add_circle
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                Rutina
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            <div className="px-6 mb-6">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'flex-1 py-2.5 text-sm font-bold rounded-lg transition-all',
                                activeTab === tab
                                    ? 'bg-white shadow text-slate-900'
                                    : 'text-secondary'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6">
                {activeTab === 'Rutina' && (
                    <div className="space-y-6">
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-500">
                                        wb_sunny
                                    </span>
                                    Rutina Mañana
                                </h3>
                                {amRoutine && (
                                    <button
                                        onClick={() => setEditingRoutine(amRoutine)}
                                        className="text-xs font-bold text-primary flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 active:scale-95 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Editar
                                    </button>
                                )}
                            </div>
                            {amRoutine ? (
                                <div className="space-y-3">
                                    {amRoutine.products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white p-4 rounded-2xl border border-gray-100 ios-shadow flex items-center gap-4"
                                        >
                                            <div
                                                className={cn(
                                                    'w-12 h-12 rounded-xl flex items-center justify-center',
                                                    product.iconBgColor || 'bg-primary/10'
                                                )}
                                            >
                                                <span className="material-symbols-outlined text-primary">
                                                    {product.iconName || 'spa'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-secondary">
                                                    {product.frequency}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                    <p className="text-secondary text-sm">
                                        Sin rutina de mañana asignada
                                    </p>
                                    <button
                                        onClick={() => setShowAssignSheet(true)}
                                        className="text-primary font-bold text-sm mt-2"
                                    >
                                        + Asignar productos
                                    </button>
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">
                                        nightlight_round
                                    </span>
                                    Rutina Noche
                                </h3>
                                {pmRoutine && (
                                    <button
                                        onClick={() => setEditingRoutine(pmRoutine)}
                                        className="text-xs font-bold text-primary flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 active:scale-95 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Editar
                                    </button>
                                )}
                            </div>
                            {pmRoutine ? (
                                <div className="space-y-3">
                                    {pmRoutine.products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white p-4 rounded-2xl border border-gray-100 ios-shadow flex items-center gap-4"
                                        >
                                            <div
                                                className={cn(
                                                    'w-12 h-12 rounded-xl flex items-center justify-center',
                                                    product.iconBgColor || 'bg-primary/10'
                                                )}
                                            >
                                                <span className="material-symbols-outlined text-primary">
                                                    {product.iconName || 'spa'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-secondary">
                                                    {product.frequency}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                    <p className="text-secondary text-sm">
                                        Sin rutina de noche asignada
                                    </p>
                                    <button
                                        onClick={() => setShowAssignSheet(true)}
                                        className="text-primary font-bold text-sm mt-2"
                                    >
                                        + Asignar productos
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'Historial' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="mb-8">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1">Key Patient Data</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="material-symbols-outlined text-red-400 text-lg">warning</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Allergies</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">Sulfa, Fragrance, Latex</p>
                                </div>
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="material-symbols-outlined text-primary text-lg">face</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Skin Type</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">Type III - Combination</p>
                                </div>
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl col-span-2 border border-gray-100 shadow-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="material-symbols-outlined text-blue-400 text-lg">clinical_notes</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chronic Conditions</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">Mild Rosacea, Seasonal Eczema</p>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Consultation Timeline</h3>
                            <span className="text-[10px] font-bold text-primary uppercase">{notes.length} Entries</span>
                        </div>

                        <div className="mb-8 bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 ios-shadow">
                            <h4 className="text-sm font-bold text-slate-800 mb-4">Nueva Entrada de Consulta</h4>

                            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
                                {(['first-visit', 'follow-up', 'routine-check'] as VisitType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setConsultationType(type)}
                                        className={cn(
                                            "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                            consultationType === type
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "bg-slate-50 text-slate-400 border border-slate-100"
                                        )}
                                    >
                                        {type === 'first-visit' ? 'Primera Cita' : type === 'follow-up' ? 'Seguimiento' : 'Control Rutina'}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                id="note-input"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Hallazgos clínicos, diagnóstico, cambios en tratamiento..."
                                className="w-full text-sm min-h-[120px] outline-none resize-none bg-slate-50/50 p-4 rounded-2xl mb-4 border border-slate-50 focus:border-primary/20 transition-colors"
                            />

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fotos de la Consulta</span>
                                    <button
                                        onClick={() => photoInputRef.current?.click()}
                                        className="text-primary text-[10px] font-bold uppercase hover:underline"
                                    >
                                        + Añadir Fotos
                                    </button>
                                    <input
                                        type="file"
                                        ref={photoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>

                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                    {consultationPhotos.map((photo, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                            <img src={photo} alt="Consultation" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setConsultationPhotos(p => p.filter((_, idx) => idx !== i))}
                                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-[10px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {isUploading && (
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-300">hourglass_top</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-gray-100">
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim() && consultationPhotos.length === 0}
                                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                                >
                                    Guardar Consulta
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 relative">
                            {notes.length > 0 ? [...notes].reverse().map((note, index) => (
                                <div key={note.id} className="flex space-x-4 relative group">
                                    <div className="flex flex-col items-center flex-shrink-0 relative">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-4 border-white ios-shadow z-10 relative transition-colors",
                                            index === 0 ? "bg-primary" : "bg-slate-300"
                                        )}></div>
                                        {index !== notes.length - 1 && (
                                            <div className="absolute top-4 bottom-[-16px] width-[2px] bg-slate-100 group-last:hidden"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 pb-8">
                                        <div className={cn(
                                            "bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all",
                                            index !== 0 && "opacity-80 scale-[0.98] grayscale-[0.2]"
                                        )}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                                        {new Date(note.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                                                        {note.type === 'first-visit' ? 'Primera Cita' :
                                                            note.type === 'follow-up' ? 'Consulta de Seguimiento' :
                                                                note.type === 'routine-check' ? 'Control de Rutina' :
                                                                    (note.content.split(' ').slice(0, 3).join(' ') || "Consulta")}
                                                    </h4>
                                                </div>
                                                <span className={cn(
                                                    "px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider",
                                                    index === 0 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {index === 0 ? "Actual" : "Historial"}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest grayscale-0">Notas de Consulta</span>
                                                        <span className="h-[1px] flex-1 bg-slate-50"></span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-slate-700 font-medium">
                                                        {note.content}
                                                    </p>
                                                </div>

                                                {note.photos && note.photos.length > 0 && (
                                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2 pb-1">
                                                        {note.photos.map((photo, i) => (
                                                            <div key={i} className="w-32 h-40 rounded-[1.5rem] overflow-hidden flex-shrink-0 border-2 border-white ios-shadow group/img relative">
                                                                <img alt="Consulta" className="w-full h-full object-cover" src={photo} />
                                                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors cursor-pointer flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-white opacity-0 group-hover/img:opacity-100 transition-opacity">fullscreen</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <button className="mt-5 flex items-center space-x-1.5 text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                                                <span>Ver Detalles Completos</span>
                                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-slate-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl">history_edu</span>
                                    </div>
                                    <p className="font-bold text-slate-400">Sin historial clínico registrado</p>
                                    <p className="text-xs mt-1">Las notas de consulta aparecerán aquí.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Progreso' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Daily Progress Photos</h3>
                            <span className="text-[10px] font-bold text-primary uppercase">{progressEntries.length} Photos</span>
                        </div>

                        <div className="space-y-4 relative">
                            <div className="absolute left-[19px] top-2 bottom-0 w-0.5 bg-slate-100"></div>

                            {progressEntries.length > 0 ? [...progressEntries].reverse().map((entry, index) => (
                                <div key={entry.id} className="flex space-x-4 relative group">
                                    <div className="flex flex-col items-center flex-shrink-0 relative">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-4 border-white ios-shadow z-10 relative transition-colors",
                                            index === 0 ? "bg-primary" : "bg-slate-300"
                                        )}></div>
                                    </div>

                                    <div className="flex-1 pb-10">
                                        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 ios-shadow">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(entry.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                {index === 0 && (
                                                    <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded-lg uppercase">Nuevo</span>
                                                )}
                                            </div>

                                            <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 border border-gray-100 relative group">
                                                <img
                                                    src={entry.photoUrl}
                                                    alt="Progreso"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <p className="text-sm font-medium text-slate-600 italic mb-4">
                                                &quot;{entry.notes || 'Sin notas del paciente'}&quot;
                                            </p>

                                            {feedbackEntryId === entry.id ? (
                                                <div className="bg-white rounded-2xl p-4 border-2 border-primary shadow-lg">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                                                            {entry.professionalFeedback ? 'Editar Feedback' : 'Añadir Feedback'}
                                                        </p>
                                                    </div>
                                                    <textarea
                                                        value={feedbackText}
                                                        onChange={(e) => setFeedbackText(e.target.value)}
                                                        placeholder="Observaciones profesionales sobre el progreso del paciente..."
                                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2 mt-3 justify-end">
                                                        <button
                                                            onClick={() => {
                                                                setFeedbackEntryId(null);
                                                                setFeedbackText('');
                                                            }}
                                                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (feedbackText.trim()) {
                                                                    await addProfessionalFeedback(entry.id, feedbackText.trim());
                                                                    setFeedbackEntryId(null);
                                                                    setFeedbackText('');
                                                                }
                                                            }}
                                                            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-all ios-shadow"
                                                        >
                                                            Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : entry.professionalFeedback ? (
                                                <div className="bg-peach-light rounded-2xl p-4 border border-primary/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-primary text-sm">medical_services</span>
                                                            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Tu Feedback</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setFeedbackEntryId(entry.id);
                                                                setFeedbackText(entry.professionalFeedback || '');
                                                            }}
                                                            className="text-primary/60 hover:text-primary"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                                                        {entry.professionalFeedback}
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setFeedbackEntryId(entry.id)}
                                                    className="w-full py-3 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add_comment</span>
                                                    Añadir Feedback Profesional
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-slate-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl">photo_library</span>
                                    </div>
                                    <p className="font-bold text-slate-400">Sin fotos cargadas todavía</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <RoutineAssignmentSheet
                patientId={patient.id}
                patientName={patient.name}
                isOpen={showAssignSheet}
                onClose={() => setShowAssignSheet(false)}
            />

            {editingRoutine && (
                <EditRoutineSheet
                    routine={editingRoutine}
                    isOpen={!!editingRoutine}
                    onClose={() => setEditingRoutine(null)}
                />
            )}

            <DoctorChatSheet
                patient={patient}
                isOpen={showChatSheet}
                onClose={() => setShowChatSheet(false)}
            />

            <EditPatientSheet
                patient={patient}
                isOpen={showEditSheet}
                onClose={() => setShowEditSheet(false)}
            />
        </div>
    );
}
