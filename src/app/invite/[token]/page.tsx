'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { invitationService, type Invitation } from '@/lib/invitation-service';
import Link from 'next/link';

export default function InvitePage() {
    const [invitation, setInvitation] = useState<(Invitation & { organization?: { name: string } }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    useEffect(() => {
        if (token) {
            checkInvitation(token);
        }
    }, [token]);

    const checkInvitation = async (tokenStr: string) => {
        setIsLoading(true);
        try {
            const { invitation, valid } = await invitationService.validateInvitation(tokenStr);
            if (valid && invitation) {
                setInvitation(invitation);
                if (invitation.email) {
                    setEmail(invitation.email);
                }
            } else {
                setMessage('El enlace de invitación es inválido o ha expirado.');
            }
        } catch (err) {
            console.error('Error validating invitation:', err);
            setMessage('Hubo un error al validar la invitación.');
        } finally {
            setIsLoading(false);
        }
    };

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/[A-Z]/.test(pwd)) return 'La contraseña debe tener al menos una mayúscula';
        if (!/[a-z]/.test(pwd)) return 'La contraseña debe tener al menos una minúscula';
        if (!/[0-9]/.test(pwd)) return 'La contraseña debe tener al menos un número';
        return null;
    };

    const validateName = (name: string): string | null => {
        if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (name.trim().length > 100) return 'El nombre es demasiado largo';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!invitation) return;

        setIsSubmitting(true);
        setMessage('');

        const nameError = validateName(name);
        if (nameError) {
            setMessage(nameError);
            setIsSubmitting(false);
            return;
        }

        const pwdError = validatePassword(password);
        if (pwdError) {
            setMessage(pwdError);
            setIsSubmitting(false);
            return;
        }

        try {
            const productionUrl = 'https://dermo-care.vercel.app';
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || productionUrl;

            const role = invitation.role || 'patient';
            const redirectPath = role === 'pro' ? '/doctor/dashboard' : '/patient/onboarding';

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${baseUrl}/auth/callback?next=${redirectPath}`,
                    data: {
                        name,
                        role: role,
                        organization_id: invitation.organization_id,
                        invited_by: invitation.invited_by
                    }
                }
            });

            if (error) throw error;

            setMessage('¡Registrado! Revisa tu email para confirmar tu cuenta y continuar el registro.');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Ha ocurrido un error';
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-[2.5rem] ios-shadow text-center">
                    <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                    <h1 className="text-xl font-bold text-neutral-900">Invitación Inválida</h1>
                    <p className="text-sm text-neutral-500">{message || 'Esta invitación ha expirado o no existe.'}</p>
                    <Link href="/auth" className="w-full inline-block bg-neutral-900 text-white rounded-xl py-3 text-sm font-bold mt-4">
                        Ir al Inicio de Sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                        Dermo<span className="sparkline-gradient bg-clip-text text-transparent">Care</span>
                    </h1>
                    <p className="text-[#7A869A] font-medium mt-2">
                        Has sido invitado {invitation.role === 'pro' ? 'al equipo de' : 'por'} <br />
                        <span className="font-bold text-neutral-900">{invitation.organization?.name || 'su clínica'}</span>
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] ios-shadow space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Tu Nombre Completo</label>
                            <input
                                type="text"
                                placeholder="Tu nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!!invitation.email}
                                className={`w-full border-none rounded-2xl py-4 px-5 text-sm outline-none transition-all placeholder:text-slate-300 ${invitation.email ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 focus:ring-2 focus:ring-primary/20'}`}
                                required
                            />
                            {invitation.email && (
                                <p className="text-[10px] text-slate-400 mt-1 ml-1">Este email fue asignado por tu doctor.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Crea Tu Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                                required
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 ml-1 leading-tight">
                                Debe contener al menos 8 caracteres, una mayúscula y un número.
                            </p>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${message.includes('¡Registrado!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span className="material-symbols-outlined text-lg">{message.includes('¡Registrado!') ? 'check_circle' : 'error'}</span>
                                {message}
                            </div>
                        )}

                        <button
                            disabled={isSubmitting}
                            className="w-full bg-neutral-900 text-white rounded-[1.25rem] py-4.5 text-base font-bold active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-neutral-200 mt-2"
                        >
                            {isSubmitting ? 'Creando cuenta...' : invitation.role === 'pro' ? 'Unirse al Equipo' : 'Comenzar Tratamiento'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
