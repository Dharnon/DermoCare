"use client";

import { useState } from "react";
import Link from "next/link";
import { useDermoCareStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface EditProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; email: string; phone: string }) => void;
    initialData: { name: string; email: string; phone: string };
}

function EditProfileSheet({ isOpen, onClose, onSave, initialData }: EditProfileSheetProps) {
    const [name, setName] = useState(initialData.name);
    const [email, setEmail] = useState(initialData.email);
    const [phone, setPhone] = useState(initialData.phone);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave({ name, email, phone });
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-[100]',
                    'bg-white rounded-t-[2rem]',
                    'max-h-[85vh] min-h-[50vh] overflow-auto'
                )}
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                {/* Handle */}
                <div className="sticky top-0 z-10 bg-white pt-3 pb-2 flex justify-center">
                    <div className="w-12 h-1.5 rounded-full bg-neutral-200" />
                </div>

                <div className="px-6 pb-32">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Editar Perfil</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-lg text-gray-600">close</span>
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                placeholder="+34 612 345 678"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 mt-8 rounded-2xl font-bold text-white bg-primary shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </>
    );
}

const accountSettings = [
    { id: "personal", label: "Información Personal", icon: "person" },
    { id: "notifications", label: "Notificaciones", icon: "notifications" },
];

const healthRecords = [
    { id: "history", label: "Historial Médico", icon: "medical_information", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { id: "prescriptions", label: "Tratamientos", icon: "receipt_long", iconBg: "bg-blue-50", iconColor: "text-blue-400", href: "/patient/treatments" },
    { id: "appointments", label: "Mis Citas", icon: "calendar_month", iconBg: "bg-green-50", iconColor: "text-green-500", href: "/patient/dashboard" },
];

export default function PatientProfilePage() {
    const { currentPatient, currentPro, updatePatient } = useDermoCareStore();
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const handleSaveProfile = (data: { name: string; email: string; phone: string }) => {
        if (!currentPatient) return;

        updatePatient(currentPatient.id, {
            name: data.name,
            contactInfo: {
                email: data.email,
                phone: data.phone,
            },
        });

        // Show success toast
        if (navigator.vibrate) navigator.vibrate(50);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Success Toast */}
            <div
                className={cn(
                    'fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all duration-300',
                    toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                )}
            >
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-semibold">Perfil actualizado</span>
            </div>

            {/* Edit Profile Sheet */}
            <EditProfileSheet
                isOpen={showEditSheet}
                onClose={() => setShowEditSheet(false)}
                onSave={handleSaveProfile}
                initialData={{
                    name: currentPatient?.name || '',
                    email: currentPatient?.contactInfo?.email || '',
                    phone: currentPatient?.contactInfo?.phone || '',
                }}
            />

            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
                <button
                    onClick={() => setShowEditSheet(true)}
                    className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
            </header>

            {/* User Info */}
            <section className="px-6 mb-10">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-primary/20 flex items-center justify-center">
                            {currentPatient?.avatarUrl ? (
                                <img
                                    src={currentPatient.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-primary">person</span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-background">
                            <span className="material-symbols-outlined text-xs">camera_alt</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">{currentPatient?.name || 'Paciente'}</h2>
                    <p className="text-sm text-secondary mt-1">{currentPatient?.contactInfo?.email}</p>
                    {currentPatient?.contactInfo?.phone && (
                        <p className="text-xs text-neutral-400 mt-0.5">{currentPatient.contactInfo.phone}</p>
                    )}
                </div>
            </section>

            {/* Doctor Info Card */}
            {currentPro && (
                <section className="px-6 mb-6">
                    <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-4 rounded-[2rem] border border-primary/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                {currentPro.avatarUrl ? (
                                    <img src={currentPro.avatarUrl} alt="Doctor" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-primary">person</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">Tu Dermatóloga</p>
                                <p className="font-bold text-neutral-800">{currentPro.name}</p>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-primary">chat</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Settings Cards */}
            <div className="px-6 space-y-4">
                {/* Account Settings */}
                <div className="bg-white p-5 rounded-[2rem] ios-shadow border border-neutral-50">
                    <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 px-1">
                        Configuración de Cuenta
                    </h3>
                    <div className="space-y-4">
                        {accountSettings.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={index === 0 ? () => setShowEditSheet(true) : undefined}
                                className="w-full flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-600">
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <span className="text-sm font-bold">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-neutral-300 group-hover:text-primary transition-colors">
                                    chevron_right
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Health & Records */}
                <div className="bg-white p-5 rounded-[2rem] ios-shadow border border-neutral-50">
                    <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 px-1">
                        Salud y Registros
                    </h3>
                    <div className="space-y-4">
                        {healthRecords.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href || "#"}
                                className="w-full flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                                        <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                                    </div>
                                    <span className="text-sm font-bold">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-neutral-300 group-hover:text-primary transition-colors">
                                    chevron_right
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <button className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-[1.5rem] flex items-center justify-center gap-2 mt-8">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
