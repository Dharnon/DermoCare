'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { Drawer } from '@/components/shared/Drawer';

interface AddPatientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (patientId: string) => void;
}

export function AddPatientForm({ isOpen, onClose, onSuccess }: AddPatientFormProps) {
    const { addPatient } = useDermoCareStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return;

        setIsSubmitting(true);

        // Add patient to store
        const newPatient = addPatient({
            name: formData.name,
            contactInfo: {
                email: formData.email,
                phone: formData.phone || undefined,
            },
        });

        setIsSubmitting(false);
        setFormData({ name: '', email: '', phone: '' });

        if (onSuccess) {
            onSuccess(newPatient.id);
        }
        onClose();
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Nuevo Paciente"
            description="Añade un nuevo paciente al sistema"
        >
            <form onSubmit={handleSubmit} className="pb-12 pt-4">
                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="María García López"
                            className={cn(
                                'w-full px-4 py-3.5 rounded-xl',
                                'bg-gray-50 border border-gray-200',
                                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                                'outline-none transition-all'
                            )}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="paciente@email.com"
                            className={cn(
                                'w-full px-4 py-3.5 rounded-xl',
                                'bg-gray-50 border border-gray-200',
                                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                                'outline-none transition-all'
                            )}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+34 612 345 678"
                            className={cn(
                                'w-full px-4 py-3.5 rounded-xl',
                                'bg-gray-50 border border-gray-200',
                                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                                'outline-none transition-all'
                            )}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.email}
                    className={cn(
                        'w-full mt-6 py-4 rounded-2xl font-bold text-white',
                        'bg-primary hover:bg-primary/90',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'active:scale-[0.98] transition-all'
                    )}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin">
                                progress_activity
                            </span>
                            Guardando...
                        </span>
                    ) : (
                        'Agregar Paciente'
                    )}
                </button>
            </form>
        </Drawer>
    );
}
