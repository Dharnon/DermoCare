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
        markMessagesAsRead,
        fetchChatMessages,
        subscribeToChat,
        unsubscribeFromChat
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

    // Fetch messages from Supabase on mount
    useEffect(() => {
        if (currentUser && currentPro) {
            fetchChatMessages(currentUser.id, currentPro.id);
        }
    }, [currentUser, currentPro, fetchChatMessages]);

    // Mark as read when viewing - only if there are unread messages
    useEffect(() => {
        if (currentUser && currentPro && conversationMessages.length > 0) {
            // Check if there are actually unread messages from the other user
            const hasUnread = conversationMessages.some(
                msg => msg.senderId === currentPro.id && !msg.isRead
            );
            if (hasUnread) {
                markMessagesAsRead(currentUser.id, currentPro.id);
            }
        }
        // Only depend on message count and unread status, not the messages array itself
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id, currentPro?.id, conversationMessages.length]);

    // Subscribe to realtime messages
    useEffect(() => {
        if (currentUser) {
            subscribeToChat(currentUser.id);
        }
        return () => {
            unsubscribeFromChat();
        };
    }, [currentUser, subscribeToChat, unsubscribeFromChat]);

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
                    avatarUrl: currentPro.avatarUrl,
                    specialization: currentPro.specialization,
                    bio: currentPro.bio
                }}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}
