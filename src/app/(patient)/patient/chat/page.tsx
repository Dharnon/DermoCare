'use client';

import { useMemo, useEffect } from 'react';
import { useDermoCareStore } from '@/lib/store';
import { ChatInterface } from '@/components/shared/ChatInterface';

export default function PatientChatPage() {
    const {
        currentUser,
        currentPro,
        chatMessages,
        sendMessage,
        markMessagesAsRead
    } = useDermoCareStore();

    // Assuming currentUser is the patient and currentPro is their doctor
    // In a real app, currentPro would be dynamic or assigned.
    // For now we use the store's currentPro.

    const conversationMessages = useMemo(() => {
        if (!currentUser || !currentPro) return [];
        return chatMessages
            .filter(msg =>
                (msg.senderId === currentUser.id && msg.receiverId === currentPro.id) ||
                (msg.senderId === currentPro.id && msg.receiverId === currentUser.id)
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [chatMessages, currentUser, currentPro]);

    // Mark as read when viewing
    useEffect(() => {
        if (currentUser && currentPro && conversationMessages.length > 0) {
            markMessagesAsRead(currentUser.id, currentPro.id);
        }
    }, [conversationMessages, currentUser, currentPro, markMessagesAsRead]);

    const handleSendMessage = (text: string) => {
        if (currentUser && currentPro) {
            sendMessage(text, currentUser.id, currentPro.id);
        }
    };

    if (!currentUser || !currentPro) return null;

    return (
        <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] fixed inset-0 top-0 bottom-20 z-10 bg-white">
            <ChatInterface
                messages={conversationMessages}
                currentUser={currentUser}
                otherUser={{
                    name: currentPro.name,
                    avatarUrl: currentPro.avatarUrl
                }}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}
