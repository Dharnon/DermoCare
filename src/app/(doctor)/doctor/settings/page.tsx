'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { BackButton } from '@/components/shared/BackButton';
import { Drawer } from '@/components/shared/Drawer';

export default function SettingsPage() {
    const router = useRouter(); // Added
    const { profile, signOut } = useAuth();
    const [orgName, setOrgName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);

    useEffect(() => {
        if (profile?.organizations?.name) {
            setOrgName(profile.organizations.name);
        }
    }, [profile]);

    const handleSave = async () => {
        if (!profile?.organization_id) return;
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('organizations')
                .update({ name: orgName })
                .eq('id', profile.organization_id);

            if (error) throw error;
            setIsEditing(false);
            // Optionally refresh profile/context
        } catch (err) {
            console.error('Error updating organization:', err);
            alert('Error al actualizar la organización');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            localStorage.removeItem('dermocare-storage'); // Clear persisted store
            router.push('/auth');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32">
            <header className="px-6 pt-12 pb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Configuración</h1>
                    <p className="text-secondary text-sm">Perfil y Organización</p>
                </div>
            </header>

            <div className="px-6 space-y-6">
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm relative overflow-hidden">
                    <h2 className="font-bold text-lg mb-4 text-neutral-900">Mi Perfil</h2>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold transition-transform active:scale-95 shadow-sm overflow-hidden bg-neutral-100">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-neutral-400">{profile.name?.[0] || 'D'}</span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsAvatarSheetOpen(true)}
                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md active:scale-90 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        </div>
                        <div>
                            <p className="font-bold text-xl text-neutral-900">{profile.name}</p>
                            <p className="text-sm text-neutral-500 mb-1">{profile.email}</p>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                    {profile.role === 'pro' ? 'Profesional' : 'Admin'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Decorational background blob */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl -z-0" />
                </div>

                <AvatarSelectionSheet
                    isOpen={isAvatarSheetOpen}
                    onClose={() => setIsAvatarSheetOpen(false)}
                    currentAvatar={profile.avatar_url}
                    onSelect={async (url) => {
                        await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
                        // Trigger re-fetch or rely on realtime if enabled, for now simple reload or context update would be ideal
                        window.location.reload(); // Simple refresh to see changes for now
                    }}
                />

                {/* Organization Section */}
                <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg text-neutral-900">Mi Organización</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-primary text-sm font-bold"
                            >
                                Editar
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-neutral-400 text-sm font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="text-primary text-sm font-bold disabled:opacity-50"
                                >
                                    {isLoading ? '...' : 'Guardar'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                                Nombre del Centro
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="w-full p-4 bg-neutral-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 font-medium"
                                />
                            ) : (
                                <div className="p-4 bg-neutral-50 rounded-xl font-medium text-neutral-900">
                                    {profile.organizations?.name || 'Sin nombre'}
                                </div>
                            )}
                            <p className="text-xs text-neutral-400 mt-2">
                                Este nombre aparecerá en las invitaciones y notificaciones a tus pacientes.
                            </p>
                        </div>

                        {/* ID for debugging/sharing */}
                        <div>
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                                ID de Organización
                            </label>
                            <div className="p-3 bg-neutral-50 rounded-xl font-mono text-xs text-neutral-500 truncate">
                                {profile.organization_id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <TeamManagement organizationId={profile.organization_id} />

                <div className="pt-8">
                    <button
                        onClick={handleSignOut}
                        className="w-full p-4 text-red-500 font-bold bg-red-50 rounded-2xl active:scale-[0.98] transition-transform"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

function AvatarSelectionSheet({ isOpen, onClose, currentAvatar, onSelect }: {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar: string | null;
    onSelect: (url: string) => void;
}) {
    // Curated list of specific branding avatars used in the project
    const projectAvatars = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDQNnShvQ1gjOi-tdPpjRYzY1KU-2c-uvnJCFKbT3Mu3_Gw1p0taFBSzPlA3oKaweWCARJLNbYbpeIxvyoE7t25vj8gBHqfB37yKWYyR8fTy_PJ5EOIvaJhVbUJiCz9M_qzd0fLkzef7zQEIHb53L2yHtK6IjTKiIcHZXkf22cuXl9Xr4QUzfq9oGDMrU-xNsCUxsXXW0LAGOZScnG9uK-pvePuwcUYh0-GCExy4qFn0CkQ5-G0M3xFJWKmMlw-JW1JZnjopoYA7GM',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCji5F1_QArQELogjT3aonVVgieY10JSt9SDXLQVccy1G3sjWGW-vUnCA2OA7XV1MBlmP1v9aaD9peUWGRcOYF2cg1ULSNe7sbJf4UUc0U_AYfy7AgWo50Z1b4UxRiB4AvlVObW5XX9AhOfAPXH9yVm4agCm8a9J2aupPWpTITQY8g1c1l-Qmqf94f96BrRYRcU7ZHpaURBZXfgOyghOZJSbdQVj5-KY7UcKFr31I9Mq-Zj1_QxDLG8-b-iLQZYdnp8RT8Tnx-ae3c',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB0r-Aoz5_kPcTwk6xXUmtllj8x74kC0L-rY3cNgnYnhLLokUYrTcxAkGt1bDcLbmsyl9Iac6kBhpV0g-DArVJqT02_AyFI4v6Tq12T45cGE8zFWP8xkdkSDv1pZ2_2jFlmodCxLOvI69ONR4ZGHMlHDuDp36XY0DJNK_qnvcTcKu-PuNpz-fCExOakEY6WKSwJncKBhT_5sMG75QKEuCQXSgZnvLTO0wp357fSOG7gHwkLG2rUNW6r76rfoRYbrw4JDJhuOEiWvwo',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaD-CbnS7BLePYAub0PFepRwyOKiM3JUo58-1mCuRRifJB_TelGKceiI-kJBSX2vHsOyB39mbyg9UlGOY2mCPIQSueSMhFttNlqEbtWT6FnpTdWGrfOvpPgvHLql6RllIMJARvbiAnCU4MYMB1KCcRHtOMUOraUgMB5JycXbfZD50E5BcakmC6qEPeuNtTdwDzQFbc0xRvLB0KyjSdWlWWhv1coSkbZNheYsVQYa4SlFxkiesguPuqB003aremN5yBjeTy3FaqXi8',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDz6A9rPQoDNd9JhWLgflE8l43MJ-_nxsmPBp6Memd_8shvvvargAQHGH1HQbjhg0tC3-gZAV1oXZjtBrTZjIChJpUyh5yu5byHHKIpPcyxA_p3JzhYZ76yD47TiMkLny1jh5y0niBtL9oGb-6tyr86OLVkHWKFtsJ0W7HClfTM2CkIraadcF0eUnEXVgEh1oigA3WGMKflIOtC28K78NnbqXf8nynehh7fcGDKA2jwnk2MIrpMWbbmw02AKWWauqcprf4Mz0xdX2U',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCq5ECXjVZ8nCfSRNVoLyI8izdEPJgmwIgGfUljWhTz_mh3g7Yypjw1r_As_sO81xGgHXN3SzplBGCaBGE9tVzx3JFfeMWuM_qrKb6xMueUvUk8m--ZB0F0G4Zje6shQeHCoZsFxhx5sl-szSBNE5nKhjukZ5IYW5mdUfGQQI-ss0KxJEidmbsXJfn2sPIPo6KJdudfII7dN33asEF4uivb4RRbJP9An8lFLFYfM6r1JrV0sHb75DLBUZDgsc1CeGMaSqlgo8gWmOw'
    ];

    // Fallback: Generated 'Micah' style avatars (Clean, flat, professional look similar to brand)
    const generatedAvatars = [
        'https://api.dicebear.com/9.x/micah/svg?seed=Doctor1&clothing=collared&backgroundColor=b6e3f4',
        'https://api.dicebear.com/9.x/micah/svg?seed=Pro2&clothing=collared&backgroundColor=ffdfbf',
        'https://api.dicebear.com/9.x/micah/svg?seed=Medic3&clothing=collared&backgroundColor=c0aede',
        'https://api.dicebear.com/9.x/micah/svg?seed=Doc4&clothing=collared&backgroundColor=b6e3f4',
        'https://api.dicebear.com/9.x/micah/svg?seed=Nurse5&clothing=collared&backgroundColor=ffdfbf',
        'https://api.dicebear.com/9.x/micah/svg?seed=Specialist6&clothing=collared&backgroundColor=c0aede',
    ];

    const avatars = [...projectAvatars, ...generatedAvatars];

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Elige tu Avatar"
            description="Selecciona una imagen profesional."
        >
            <div className="pb-12 grid grid-cols-3 gap-4 px-2">
                {avatars.map((url, i) => (
                    <button
                        key={i}
                        onClick={() => { onSelect(url); onClose(); }}
                        className={`aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all p-1 ${currentAvatar === url ? 'border-primary scale-95' : 'border-transparent hover:scale-105'}`}
                    >
                        <div className="w-full h-full rounded-[1.2rem] bg-neutral-50 overflow-hidden">
                            <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                        </div>
                    </button>
                ))}
            </div>
        </Drawer>
    );
}

function TeamManagement({ organizationId }: { organizationId: string }) {
    const [members, setMembers] = useState<any[]>([]);
    const [inviteLink, setInviteLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at');
            if (data) setMembers(data);
        };
        fetchMembers();
    }, [organizationId]);

    const generateTeamInvite = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.rpc('create_team_invite', {
                p_org_id: organizationId
            });
            if (error) throw error;
            const link = `${window.location.origin}/auth?invite=${data}`;
            setInviteLink(link);
        } catch (err) {
            console.error(err);
            alert('Error al generar enlace');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-neutral-900">Equipo Médico</h2>
                <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-lg">
                    {members.length} miembros
                </span>
            </div>

            <div className="space-y-4 mb-6">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-colors">
                        <div className="w-10 h-10 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {member.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-neutral-900 text-sm truncate">{member.name}</p>
                            <p className="text-xs text-neutral-400 truncate">{member.email}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {member.role === 'admin' ? 'Admin' : 'Pro'}
                        </span>
                    </div>
                ))}
            </div>

            {!inviteLink ? (
                <button
                    onClick={generateTeamInvite}
                    disabled={isLoading}
                    className="w-full py-3 border border-dashed border-neutral-300 rounded-xl text-neutral-500 font-bold text-sm hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">add_link</span>
                    {isLoading ? 'Generando...' : 'Invitar compañero'}
                </button>
            ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs text-green-800 font-bold mb-2">¡Enlace de invitación generado!</p>
                    <div className="text-[10px] font-mono text-green-700 bg-white/50 p-2 rounded mb-2 break-all">
                        {inviteLink}
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(inviteLink);
                            setInviteLink('');
                            alert('Copiado al portapapeles');
                        }}
                        className="text-xs font-bold text-green-700 underline"
                    >
                        Copiar y cerrar
                    </button>
                </div>
            )}
        </div>
    );
}
