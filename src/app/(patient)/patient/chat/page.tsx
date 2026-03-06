'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDermoCareStore } from '@/lib/store';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import type { User } from '@/lib/types';

// Connection status indicator
function ConnectionIndicator({ status }: { status: string }) {
    const colors: Record<string, string> = {
        connected: 'bg-green-500',
        connecting: 'bg-yellow-500 animate-pulse',
        reconnecting: 'bg-orange-500 animate-pulse',
        disconnected: 'bg-red-500',
    };

    const labels: Record<string, string> = {
        connected: 'Conectado',
        connecting: 'Conectando...',
        reconnecting: 'Reconectando...',
        disconnected: 'Desconectado',
    };

    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />
            <span className="text-xs text-gray-500">{labels[status] || status}</span>
        </div>
    );
}

export default function PatientChatPage() {
    const router = useRouter();
    const { profile, isLoading: authLoading } = useAuth();
    const { currentPro } = useDermoCareStore();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !profile) {
            router.push('/auth');
        }
    }, [authLoading, profile, router]);

    const patientId = profile?.id || '';
    const proId = currentPro?.id || '';

    const {
        messages,
        connectionStatus,
        isLoading,
        error,
        sendMessage,
        markAsRead,
    } = useRealtimeChat({
        userId: patientId,
        otherUserId: proId,
        enabled: !!(patientId && proId),
    });

    // Mark messages as read when viewing
    useEffect(() => {
        if (messages.length > 0) {
            markAsRead();
        }
    }, [messages.length, markAsRead]);

    if (authLoading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
            </div>
        );
    }

    if (!currentPro) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">chat</span>
                    <p className="text-gray-500 font-medium">No tienes un profesional asignado</p>
                    <p className="text-sm text-gray-400 mt-1">Contacta con tu farmacia para que te asignen un profesional</p>
                </div>
            </div>
        );
    }

    const currentUserForChat: User = {
        id: patientId,
        name: profile.name || 'Paciente',
        role: 'patient',
        avatarUrl: profile.avatar_url || undefined,
        contactInfo: { email: profile.email || '' },
    };

    // Convert messages to the format expected by ChatInterface
    const chatMessages = messages.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.text,
        timestamp: m.timestamp,
        isRead: m.is_read,
        type: m.type as 'text' | 'image',
    }));

    return (
        <div className="h-[calc(100vh-80px)] fixed inset-0 top-0 bottom-20 z-10 bg-white flex flex-col">
            {/* Header with connection status */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--peach-light)] flex items-center justify-center overflow-hidden">
                        {currentPro.avatarUrl ? (
                            <img src={currentPro.avatarUrl} alt={currentPro.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-[var(--accent)]">person</span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 text-sm">{currentPro.name}</h2>
                        <ConnectionIndicator status={connectionStatus} />
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]" />
                    </div>
                ) : chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">chat_bubble</span>
                        <p className="text-gray-500 font-medium">Inicia la conversación</p>
                        <p className="text-sm text-gray-400 mt-1">Envía un mensaje a tu profesional</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        const isOwn = msg.senderId === patientId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn
                                            ? 'bg-[var(--primary)] text-gray-900 rounded-br-sm'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[10px] opacity-60">
                                            {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        {isOwn && (
                                            <span className={`material-symbols-outlined text-[10px] ${msg.isRead ? 'text-blue-500' : 'opacity-60'}`}>
                                                {msg.isRead ? 'done_all' : 'done'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                        if (input.value.trim()) {
                            sendMessage(input.value);
                            input.value = '';
                        }
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        name="message"
                        type="text"
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                        disabled={connectionStatus === 'disconnected'}
                    />
                    <button
                        type="submit"
                        disabled={connectionStatus === 'disconnected'}
                        className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
                        aria-label="Enviar mensaje"
                    >
                        <span className="material-symbols-outlined text-gray-900 text-lg">send</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
