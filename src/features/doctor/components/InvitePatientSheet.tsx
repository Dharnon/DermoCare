'use client';

import { useState } from 'react';
import { Drawer } from '@/components/shared/Drawer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

interface InvitePatientSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InvitePatientSheet({ isOpen, onClose }: InvitePatientSheetProps) {
    const { profile } = useAuth();
    const [inviteLink, setInviteLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const generateInvite = async () => {
        if (!profile) {
            return;
        }

        if (!profile.organization_id) {
            alert('Error: No tienes una organización asignada.');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.rpc('create_patient_invite', {
                p_org_id: profile.organization_id,
                p_invited_by: profile.id
            });

            if (error) {
                throw error;
            }

            // Generate full URL
            const baseUrl = 'https://dermo-care.vercel.app';
            const link = `${baseUrl}/auth?invite=${data}`;
            setInviteLink(link);
            setShowQR(true); // Automatically show QR after generation
        } catch (err: any) {
            // Error is handled - user feedback through alert or state
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Invitar Paciente"
            description="Genera un enlace mágico para vincular a un nuevo paciente"
        >
            <div className="pb-12 space-y-6">
                <div className="bg-neutral-50 p-6 rounded-[2.5rem] border border-neutral-100 text-center space-y-4">
                    {!inviteLink ? (
                        <>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <span className="material-symbols-outlined text-primary text-3xl">share</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900">Enlace de Vinculación</h3>
                                <p className="text-xs text-neutral-500 max-w-[200px] mx-auto mt-1">
                                    Genera un enlace o un código QR para que tu paciente se asocie a tu centro.
                                </p>
                            </div>
                            <button
                                onClick={generateInvite}
                                disabled={isLoading}
                                className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Generando...' : 'Generar Invitación'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {showQR && (
                                <div className="bg-white p-6 rounded-[2rem] shadow-inner inline-block mx-auto border border-neutral-100 flex flex-col items-center">
                                    <div className="relative group p-2 bg-white rounded-xl">
                                        <QRCodeSVG
                                            value={inviteLink}
                                            size={180}
                                            level="H"
                                            includeMargin={false}
                                            imageSettings={{
                                                src: "/logo-icon.png", // We should ensure this exists or use a generic icon
                                                x: undefined,
                                                y: undefined,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-4">Escanea para Registrarte</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="bg-white p-4 rounded-2xl border border-neutral-100 break-all text-[10px] font-mono text-neutral-400">
                                    {inviteLink}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={copyToClipboard}
                                        className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {isCopied ? 'check' : 'content_copy'}
                                        </span>
                                        {isCopied ? 'Copiado' : 'Copiar'}
                                    </button>
                                    <button
                                        onClick={() => setShowQR(!showQR)}
                                        className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${showQR ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">qr_code_2</span>
                                        {showQR ? 'Ocultar' : 'Ver QR'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => { setInviteLink(''); setShowQR(false); }}
                                    className="text-xs font-bold text-neutral-300 uppercase tracking-widest pt-2 hover:text-neutral-500 transition-colors"
                                >
                                    Generar otro enlace
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-2">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">¿Cómo funciona?</h4>
                    <div className="space-y-4">
                        {[
                            { icon: 'link', text: 'Compartes el enlace por WhatsApp o Email.' },
                            { icon: 'app_registration', text: 'El paciente se registra con sus datos.' },
                            { icon: 'verified', text: 'Se vincula a tu centro automáticamente.' }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-sm text-neutral-500">{step.icon}</span>
                                </div>
                                <p className="text-sm text-neutral-600 leading-tight pt-1">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Drawer>
    );
}
