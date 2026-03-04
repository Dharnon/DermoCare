'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
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
    const setSessionUser = useDermoCareStore((state) => state.setSessionUser);

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, organizations(*)')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setProfile(data);
            setSessionUser(data as any);
        }
    }, [setSessionUser]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
                // Also clear store user if desired, though store might handle it differently
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signOut = async () => {
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
