'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { AdherenceBar } from '@/features/doctor/components/AdherenceBar';
import { RoutineAssignmentSheet } from '@/features/doctor/components/RoutineAssignmentSheet';
import { EditRoutineSheet } from '@/features/doctor/components/EditRoutineSheet';
import { DoctorChatSheet } from '@/features/doctor/components/DoctorChatSheet';
import { calculateWeeklyAdherence, getAdherenceRiskLevel } from '@/lib/adherence';
import type { Routine } from '@/lib/types';

const tabs = ['Rutina', 'Notas', 'Progreso'] as const;
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
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [newNote, setNewNote] = useState('');

    const { setFab, hideFab } = useUIStore();

    const {
        getPatientById,
        getRoutinesByPatient,
        adherenceLogs,
        addClinicalNote,
        getClinicalNotes,
        currentPro,
    } = useDermoCareStore();

    // Set Global FAB Action - Context Aware!
    useEffect(() => {
        setFab(() => setShowChatSheet(true), 'chat');
        return () => hideFab();
    }, [setFab, hideFab]);

    const patient = getPatientById(id);
    const routines = getRoutinesByPatient(id);
    const notes = getClinicalNotes(id);

    // Calculate adherence
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
        if (!newNote.trim() || !currentPro) return;

        addClinicalNote({
            patientId: patient.id,
            proId: currentPro.id,
            content: newNote.trim(),
            isPrivate: true,
        });
        setNewNote('');
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-center">
                <Link
                    href="/doctor/patients"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center ios-shadow border border-neutral-50"
                >
                    <span className="material-symbols-outlined text-neutral-600">
                        arrow_back_ios_new
                    </span>
                </Link>
                <h1 className="text-lg font-bold">Detalle Paciente</h1>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center ios-shadow border border-neutral-50">
                    <span className="material-symbols-outlined text-neutral-600">
                        more_horiz
                    </span>
                </button>
            </header>

            {/* Profile Section */}
            <section className="px-6 mb-6">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
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
                    <p className="text-secondary text-sm font-medium mb-4">
                        {patient.contactInfo?.email}
                    </p>

                    {/* Adherence Badge */}
                    <div className="w-full max-w-xs mb-4">
                        <AdherenceBar
                            percentage={adherence}
                            riskLevel={riskLevel}
                        />
                    </div>

                    {/* Quick Action Buttons */}
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

            {/* Tabs */}
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

            {/* Tab Content */}
            <div className="px-6">
                {/* Rutina Tab */}
                {activeTab === 'Rutina' && (
                    <div className="space-y-6">
                        {/* Morning Routine */}
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

                        {/* Evening Routine */}
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

                {/* Notas Tab */}
                {activeTab === 'Notas' && (
                    <div className="space-y-4">
                        {/* Add Note */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 ios-shadow">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Añadir nota clínica..."
                                className="w-full min-h-[100px] text-sm resize-none outline-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                                >
                                    Guardar Nota
                                </button>
                            </div>
                        </div>

                        {/* Existing Notes */}
                        {notes.length > 0 ? (
                            notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="bg-white p-4 rounded-2xl border border-gray-100 ios-shadow"
                                >
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {note.content}
                                    </p>
                                    <p className="text-[10px] text-secondary mt-3 uppercase font-bold">
                                        {new Date(note.createdAt).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-secondary">
                                <span className="material-symbols-outlined text-4xl opacity-30">
                                    edit_note
                                </span>
                                <p className="mt-2 text-sm">Sin notas clínicas</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Progreso Tab */}
                {activeTab === 'Progreso' && (
                    <div className="text-center py-12 text-secondary">
                        <span className="material-symbols-outlined text-5xl opacity-30">
                            trending_up
                        </span>
                        <p className="mt-4 font-medium">
                            Fotos de progreso próximamente
                        </p>
                    </div>
                )}
            </div>

            {/* Routine Assignment Sheet */}
            <RoutineAssignmentSheet
                patientId={patient.id}
                patientName={patient.name}
                isOpen={showAssignSheet}
                onClose={() => setShowAssignSheet(false)}
            />

            {/* Edit Routine Sheet */}
            {editingRoutine && (
                <EditRoutineSheet
                    routine={editingRoutine}
                    isOpen={!!editingRoutine}
                    onClose={() => setEditingRoutine(null)}
                />
            )}

            {/* Chat Sheet */}
            <DoctorChatSheet
                patient={patient}
                isOpen={showChatSheet}
                onClose={() => setShowChatSheet(false)}
            />
        </div>
    );
}
