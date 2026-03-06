'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import type { User } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface DoctorChatSheetProps {
    patient: User;
    isOpen: boolean;
    onClose: () => void;
}

// Connection status indicator
function ConnectionDot({ status }: { status: string }) {
    const colors: Record<string, string> = {
        connected: 'bg-green-500',
        connecting: 'bg-yellow-500 animate-pulse',
        reconnecting: 'bg-orange-500 animate-pulse',
        disconnected: 'bg-red-500',
    };

    return (
        <div
            className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`}
            title={status}
        />
    );
}

export function DoctorChatSheet({ patient, isOpen, onClose }: DoctorChatSheetProps) {
    const { profile } = useAuth();
    const doctorId = profile?.id || '';
    const patientId = patient?.id || '';

    const {
        messages,
        connectionStatus,
        isLoading,
        error,
        sendMessage,
        markAsRead,
    } = useRealtimeChat({
        userId: doctorId,
        otherUserId: patientId,
        enabled: isOpen && !!(doctorId && patientId),
    });

    // Mark as read when viewing
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            markAsRead();
        }
    }, [isOpen, messages.length, markAsRead]);

    if (!isOpen || !profile) return null;

    const handleSendMessage = (text: string) => {
        sendMessage(text);
    };

    // Convert messages to display format
    const displayMessages = messages.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.text,
        timestamp: m.timestamp,
        isRead: m.is_read,
        type: m.type as 'text' | 'image',
    }));

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            bodyClassName="p-0 flex flex-col overflow-hidden h-full"
            className="h-[85vh]"
        >
            {/* Header */}
            <div className="bg-white border-b border-neutral-100 px-6 py-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                        {patient.avatarUrl ? (
                            <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-neutral-400">person</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-neutral-900 leading-tight">{patient.name}</h2>
                            <ConnectionDot status={connectionStatus} />
                        </div>
                        <p className="text-xs text-secondary">Chat Directo</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 active:scale-95 transition-all"
                    aria-label="Cerrar chat"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]" />
                    </div>
                ) : displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">chat_bubble</span>
                        <p className="text-gray-500 font-medium text-sm">Sin mensajes aún</p>
                        <p className="text-xs text-gray-400 mt-1">Inicia la conversación con {patient.name}</p>
                    </div>
                ) : (
                    displayMessages.map((msg) => {
                        const isOwn = msg.senderId === doctorId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn
                                            ? 'bg-[var(--primary)] text-gray-900 rounded-br-sm'
                                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
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

            {/* Input */}
            <div className="bg-white border-t border-neutral-100 px-4 py-3 flex-shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                        if (input.value.trim()) {
                            handleSendMessage(input.value);
                            input.value = '';
                        }
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        name="message"
                        type="text"
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
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
        </Drawer>
    );
}
