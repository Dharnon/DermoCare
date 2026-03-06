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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                storeRef.current(data as any);
            } else {
                console.error('Profile fetch error:', error?.message);
                setProfile(null);
            }
        } catch (err) {
            console.error('Profile fetch exception:', err);
            setProfile(null);
        }
    }

    useEffect(() => {
        let active = true;

        // 1. Get initial session
        supabase.auth.getSession().then(async ({ data: { session: s } }) => {
            if (!active) return;

            setSession(s);
            setUser(s?.user ?? null);

            if (s?.user) {
                await fetchProfile(s.user.id);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
