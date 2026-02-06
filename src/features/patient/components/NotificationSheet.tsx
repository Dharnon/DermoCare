'use client';

import { useState, useEffect } from 'react';
import { Drawer } from '@/components/shared/Drawer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NotificationSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationSheet({ isOpen, onClose }: NotificationSheetProps) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && user) {
            fetchNotifications();
            markAsRead();
        }
    }, [isOpen, user]);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (!error) setNotifications(data || []);
        setIsLoading(false);
    };

    const markAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user?.id)
            .eq('is_read', false);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'routine_update': return 'checklist';
            case 'appointment_reminder': return 'calendar_month';
            default: return 'notifications';
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Notificaciones"
            description="Entérate de cambios en tu tratamiento"
        >
            <div className="pb-12 space-y-4">
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-neutral-300 text-3xl">notifications_off</span>
                        </div>
                        <p className="text-sm text-neutral-400">No tienes notificaciones por ahora</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={cn(
                                "p-5 rounded-[2.5rem] border transition-all",
                                !notif.is_read ? "bg-primary/5 border-primary/10 shadow-sm" : "bg-white border-neutral-100 opacity-60"
                            )}
                        >
                            <div className="flex gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                    !notif.is_read ? "bg-primary text-white" : "bg-neutral-100 text-neutral-400"
                                )}>
                                    <span className="material-symbols-outlined">{getTypeIcon(notif.type)}</span>
                                </div>
                                <div className="flex-1 space-y-0.5">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-neutral-900 leading-tight">{notif.title}</h4>
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                            {new Date(notif.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-600 leading-normal">{notif.body}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Drawer>
    );
}
