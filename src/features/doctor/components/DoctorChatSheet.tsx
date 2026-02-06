'use client';

import { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import { ChatInterface } from '@/components/shared/ChatInterface';
import type { User } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface DoctorChatSheetProps {
    patient: User;
    isOpen: boolean;
    onClose: () => void;
}

export function DoctorChatSheet({ patient, isOpen, onClose }: DoctorChatSheetProps) {
    const {
        currentPro,
        chatMessages,
        sendMessage,
        markMessagesAsRead,
        fetchChatMessages
    } = useDermoCareStore();

    const conversationMessages = useMemo(() => {
        if (!currentPro || !patient) return [];
        return chatMessages
            .filter(msg =>
                (msg.senderId === currentPro.id && msg.receiverId === patient.id) ||
                (msg.senderId === patient.id && msg.receiverId === currentPro.id)
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [chatMessages, currentPro, patient]);

    // Fetch messages from Supabase when sheet opens
    useEffect(() => {
        if (isOpen && currentPro && patient) {
            fetchChatMessages(currentPro.id, patient.id);
        }
    }, [isOpen, currentPro, patient, fetchChatMessages]);

    // Mark as read when viewing - only if there are unread messages
    useEffect(() => {
        if (isOpen && currentPro && patient && conversationMessages.length > 0) {
            // Check if there are actually unread messages from the patient
            const hasUnread = conversationMessages.some(
                msg => msg.senderId === patient.id && !msg.isRead
            );
            if (hasUnread) {
                markMessagesAsRead(currentPro.id, patient.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentPro?.id, patient?.id, conversationMessages.length]);

    const handleSendMessage = (text: string) => {
        if (currentPro && patient) {
            sendMessage(text, currentPro.id, patient.id);
        }
    };

    if (!isOpen || !currentPro) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            bodyClassName="p-0 flex flex-col overflow-hidden h-full"
            className="h-[85vh]"
        >
            {/* Custom Header */}
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
                        <h2 className="font-bold text-neutral-900 leading-tight">{patient.name}</h2>
                        <p className="text-xs text-secondary">Chat Directo</p>
                    </div>
                </div>
                {/* Close button handled by Drawer backdrop usually, but keeping explicit one looks nice or we rely on drag.
                    Vaul is draggable. Maybe specific close button is redundant if we trust gesture.
                    Let's keep it but make it trigger onClose
                */}
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-hidden relative bg-neutral-50">
                <ChatInterface
                    messages={conversationMessages}
                    currentUser={currentPro}
                    otherUser={{ name: patient.name, avatarUrl: patient.avatarUrl }}
                    onSendMessage={handleSendMessage}
                    className="h-full bg-transparent"
                    showHeader={false}
                />
            </div>
        </Drawer>
    );
}
