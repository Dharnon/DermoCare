'use client';

import { useState, useEffect } from 'react';
import { Drawer } from '@/components/shared/Drawer';
import { useDermoCareStore } from '@/lib/store';
import type { User } from '@/lib/types';

interface EditPatientSheetProps {
    isOpen: boolean;
    onClose: () => void;
    patient: User;
}

export function EditPatientSheet({ isOpen, onClose, patient }: EditPatientSheetProps) {
    const { updatePatient } = useDermoCareStore();
    const [name, setName] = useState(patient.name);
    const [email, setEmail] = useState(patient.contactInfo?.email || '');
    const [bio, setBio] = useState(patient.bio || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(patient.name);
            setEmail(patient.contactInfo?.email || '');
            setBio(patient.bio || '');
        }
    }, [isOpen, patient]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updatePatient(patient.id, {
                name,
                contactInfo: { ...patient.contactInfo, email },
                bio
            });
            onClose();
        } catch (err) {
            console.error('Error saving patient:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Editar Paciente">
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Nombre del paciente"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="email@ejemplo.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Notas / Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        placeholder="Notas sobre el paciente..."
                        rows={3}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading || !name.trim()}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold disabled:opacity-50"
                >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </Drawer>
    );
}
