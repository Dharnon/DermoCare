'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/lib/services';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'pro'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  const router = useRouter();

  // Check for invite token on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    if (inviteToken) {
      setIsLogin(false); // Switch to register
      setRole('patient'); // Default to patient for invites
      resolveInvite(inviteToken);
    }
  }, []);

  const resolveInvite = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*, organization:organizations(*)')
        .eq('token', token)
        .single();

      if (error) throw error;
      if (data && data.organization) {
        setSelectedOrg(data.organization);
      }
      if (data && data.invited_by) {
        setInvitedBy(data.invited_by);
      }
    } catch (err) {
      console.error('Invite token invalid:', err);
    }
  };

  // Organization search for patients
  const [selectedOrg, setSelectedOrg] = useState<{ id: string, name: string } | null>(null);
  const [orgSearch, setOrgSearch] = useState('');
  const [orgResults, setOrgResults] = useState<any[]>([]);

  const handleOrgSearch = async (val: string) => {
    setOrgSearch(val);
    if (val.length > 2) {
      const results = await organizationService.searchOrganizations(val);
      setOrgResults(results);
    } else {
      setOrgResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Redirection will be handled by AuthContext or a separate useEffect
        // Note: The router.push is a fallback, AuthContext usually does it
        setTimeout(() => {
          router.push(role === 'pro' ? '/doctor/dashboard' : '/patient/dashboard');
        }, 100);
      } else {
        // Sign Up logic
        if (role === 'patient' && !selectedOrg) {
          throw new Error('Por favor, selecciona tu Farmacia o Centro.');
        }

        // Get base URL for email redirect
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
            data: {
              name,
              role,
              organization_id: role === 'patient' ? selectedOrg?.id : null,
              invited_by: invitedBy
            }
          }
        });

        if (error) throw error;

        if (data.user && role === 'pro' && orgName) {
          await organizationService.createOrganization(orgName, data.user.id);
        }

        setMessage('¡Registrado! Revisa tu email para confirmar tu cuenta.');
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Dermo<span className="sparkline-gradient bg-clip-text text-transparent">Care</span>
          </h1>
          <p className="text-[#7A869A] font-medium">{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] ios-shadow space-y-6">
          {/* Role Selector */}
          <div className="flex p-1 bg-neutral-100 rounded-2xl">
            <button
              onClick={() => setRole('patient')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${role === 'patient' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
            >
              Paciente
            </button>
            <button
              onClick={() => setRole('pro')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${role === 'pro' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
            >
              Profesional
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                {role === 'pro' ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nombre de la Farmacia/Clínica</label>
                    <input
                      type="text"
                      placeholder="Ej. Farmacia San Juan"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                      required
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Busca tu Farmacia/Centro</label>
                    {selectedOrg ? (
                      <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-2xl py-4 px-5">
                        <span className="text-sm font-semibold text-primary">{selectedOrg.name}</span>
                        <button onClick={() => setSelectedOrg(null)} className="material-symbols-outlined text-sm text-primary">close</button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Escribe el nombre..."
                          value={orgSearch}
                          onChange={(e) => handleOrgSearch(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                        />
                        {orgResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                            {orgResults.map((org) => (
                              <button
                                key={org.id}
                                type="button"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setOrgResults([]);
                                }}
                                className="w-full text-left px-5 py-4 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                              >
                                {org.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            {message && (
              <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${message.includes('¡Registrado!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <span className="material-symbols-outlined text-lg">{message.includes('¡Registrado!') ? 'check_circle' : 'error'}</span>
                {message}
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white rounded-[1.25rem] py-4.5 text-base font-bold active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-neutral-200"
            >
              {isLoading ? 'Procesando...' : (isLogin ? 'Entrar Ahora' : 'Crear Mi Cuenta')}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-neutral-400 hover:text-neutral-900 font-semibold transition-colors"
            >
              {isLogin ? '¿Nuevo en DermoCare? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
