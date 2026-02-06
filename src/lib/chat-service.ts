import { supabase } from './supabase';

// Type for realtime payload
type RealtimePayload = { new: Record<string, unknown> };

export interface ChatMessage {
    id: string;
    text: string;
    sender_id: string;
    receiver_id: string;
    is_read: boolean;
    type: 'text' | 'image';
    timestamp: string;
}

export const chatService = {
    /**
     * Get all messages between two users
     */
    async getMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Send a new message
     */
    async sendMessage(
        senderId: string,
        receiverId: string,
        text: string,
        type: 'text' | 'image' = 'text'
    ): Promise<ChatMessage | null> {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                text,
                sender_id: senderId,
                receiver_id: receiverId,
                type,
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return null;
        }

        return data;
    },

    /**
     * Mark messages as read
     */
    async markAsRead(messageIds: string[]): Promise<void> {
        await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .in('id', messageIds);
    },

    /**
     * Mark all messages from a sender as read
     */
    async markConversationAsRead(currentUserId: string, otherUserId: string): Promise<void> {
        await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', currentUserId);
    },

    /**
     * Subscribe to new messages (Realtime)
     */
    subscribeToMessages(
        userId: string,
        onNewMessage: (message: ChatMessage) => void
    ) {
        const channel = supabase
            .channel('chat_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `receiver_id=eq.${userId}`,
                },
                (payload: RealtimePayload) => {
                    onNewMessage(payload.new as unknown as ChatMessage);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    /**
     * Subscribe to messages for a specific conversation
     */
    subscribeToConversation(
        userId1: string,
        userId2: string,
        onNewMessage: (message: ChatMessage) => void
    ) {
        const channel = supabase
            .channel(`conversation_${userId1}_${userId2}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                },
                (payload: RealtimePayload) => {
                    const message = payload.new as unknown as ChatMessage;
                    // Filter to only messages in this conversation
                    if (
                        (message.sender_id === userId1 && message.receiver_id === userId2) ||
                        (message.sender_id === userId2 && message.receiver_id === userId1)
                    ) {
                        onNewMessage(message);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    /**
     * Get unread message count
     */
    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        return error ? 0 : count || 0;
    },

    /**
     * Get conversation list (latest message with each contact)
     */
    async getConversations(userId: string): Promise<{
        contactId: string;
        contactName: string;
        contactAvatar?: string;
        lastMessage: string;
        lastMessageTime: string;
        unreadCount: number;
    }[]> {
        // Get all messages involving this user
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*, sender:profiles!sender_id(id, name, avatar_url), receiver:profiles!receiver_id(id, name, avatar_url)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('timestamp', { ascending: false });

        if (error || !messages) return [];

        // Group by contact
        const conversationsMap = new Map<string, {
            contactId: string;
            contactName: string;
            contactAvatar?: string;
            lastMessage: string;
            lastMessageTime: string;
            unreadCount: number;
        }>();

        for (const msg of messages) {
            const isIncoming = msg.receiver_id === userId;
            const contactId = isIncoming ? msg.sender_id : msg.receiver_id;
            const contact = isIncoming ? msg.sender : msg.receiver;

            if (!conversationsMap.has(contactId)) {
                conversationsMap.set(contactId, {
                    contactId,
                    contactName: contact?.name || 'Usuario',
                    contactAvatar: contact?.avatar_url,
                    lastMessage: msg.text,
                    lastMessageTime: msg.timestamp,
                    unreadCount: isIncoming && !msg.is_read ? 1 : 0,
                });
            } else if (isIncoming && !msg.is_read) {
                const conv = conversationsMap.get(contactId)!;
                conv.unreadCount++;
            }
        }

        return Array.from(conversationsMap.values());
    },
};
