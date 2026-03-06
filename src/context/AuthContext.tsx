'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { ProfileRow } from '@/lib/types';
import { useDermoCareStore } from '@/lib/store';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: ProfileRow | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfileToStoreUser(profile: ProfileRow) {
    return {
        id: profile.id,
        role: profile.role,
        name: profile.name ?? profile.email ?? 'Usuario',
        avatarUrl: profile.avatar_url ?? undefined,
        contactInfo: {
            email: profile.email ?? '',
        },
        bio: profile.bio ?? undefined,
        specialization: profile.specialization ?? undefined,
        organization_id: profile.organization_id ?? undefined,
        invitedBy: profile.invited_by ?? undefined,
    };
}

interface AuthProviderProps {
    children: React.ReactNode;
    initialSession?: Session | null;
    initialUser?: User | null;
    initialProfile?: ProfileRow | null;
}

export function AuthProvider({
    children,
    initialSession = null,
    initialUser = null,
    initialProfile = null,
}: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(initialSession);
    const [user, setUser] = useState<User | null>(initialUser);
    const [profile, setProfile] = useState<ProfileRow | null>(initialProfile);
    const [isLoading, setIsLoading] = useState(false);

    // Use ref for store function to avoid re-triggering effects
    const storeRef = useRef(useDermoCareStore.getState().setSessionUser);

    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, organizations(*)')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data);
                storeRef.current = useDermoCareStore.getState().setSessionUser;
                storeRef.current(mapProfileToStoreUser(data));
            } else {
                // Fallback when relation join is not available due schema/RLS.
                const { data: basicProfile, error: basicError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (!basicError && basicProfile) {
                    setProfile(basicProfile as ProfileRow);
                    storeRef.current = useDermoCareStore.getState().setSessionUser;
                    storeRef.current(mapProfileToStoreUser(basicProfile as ProfileRow));
                } else {
                    console.error('Profile fetch error:', error?.message || basicError?.message);
                    setProfile(null);
                }
            }
        } catch (err) {
            console.error('Profile fetch exception:', err);
            setProfile(null);
        }
    }

    useEffect(() => {
        if (initialProfile) {
            storeRef.current = useDermoCareStore.getState().setSessionUser;
            storeRef.current(mapProfileToStoreUser(initialProfile));
        }
    }, [initialProfile]);

    useEffect(() => {
        let active = true;
        setIsLoading(true);

        // 1. Get initial session
        supabase.auth.getSession().then(async ({ data: { session: s } }) => {
            if (!active) return;

            setSession(s);
            setUser(s?.user ?? null);

            if (s?.user) {
                if (!initialProfile || initialProfile.id !== s.user.id) {
                    await fetchProfile(s.user.id);
                }
            }

            if (active) setIsLoading(false);
        }).catch(() => {
            if (active) setIsLoading(false);
        });

        // 2. Listen for changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                if (!active) return;

                setSession(s);
                setUser(s?.user ?? null);

                if (s?.user) {
                    await fetchProfile(s.user.id);
                } else {
                    setProfile(null);
                }

                if (active) setIsLoading(false);
            }
        );

        // 3. Safety net: never stay loading more than 8 seconds
        const timeout = setTimeout(() => {
            if (active) setIsLoading(false);
        }, 8000);

        return () => {
            active = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [initialProfile]);

    const signOut = async () => {
        setProfile(null);
        setUser(null);
        setSession(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
