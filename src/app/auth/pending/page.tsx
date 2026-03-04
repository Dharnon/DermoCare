'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PendingVerificationPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setEmail(user.email);
            }
        };
        getUser();
    }, []);

    const handleResendEmail = async () => {
        if (!email) return;

        setResending(true);
        setMessage('');

        try {
            const baseUrl = 'https://dermo-care.vercel.app';
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${baseUrl}/auth/callback`
                }
            });

            if (error) throw error;
            setMessage('¡Email reenviado! Revisa tu bandeja de entrada.');
        } catch (err: any) {
            setMessage(err.message || 'Error al reenviar el email');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm text-center space-y-6">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900">
                        Dermo<span className="sparkline-gradient bg-clip-text text-transparent">Care</span>
                    </h1>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-[2.5rem] ios-shadow space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl">mark_email_unread</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-neutral-900">Verifica tu email</h2>
                        <p className="text-neutral-500">
                            Hemos enviado un enlace de confirmación a:
                        </p>
                        {email && (
                            <p className="font-semibold text-primary">{email}</p>
                        )}
                    </div>

                    <div className="text-sm text-neutral-500 space-y-2">
                        <p>Por favor, haz clic en el enlace del email para verificar tu cuenta.</p>
                        <p className="text-xs">Si no recibes el email, revisa tu carpeta de spam.</p>
                    </div>

                    <button
                        onClick={handleResendEmail}
                        disabled={resending}
                        className="w-full py-4 bg-primary/10 text-primary rounded-2xl font-bold text-sm transition-all hover:bg-primary/20 disabled:opacity-50"
                    >
                        {resending ? 'Enviando...' : 'Reenviar Email de Confirmación'}
                    </button>

                    {message && (
                        <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* Back link */}
                <Link
                    href="/auth"
                    className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                    ← Volver a iniciar sesión
                </Link>
            </div>
        </div>
    );
}
