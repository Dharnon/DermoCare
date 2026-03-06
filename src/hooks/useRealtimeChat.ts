'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
    id: string;
    text: string;
    sender_id: string;
    receiver_id: string;
    is_read: boolean;
    type: 'text' | 'image';
    timestamp: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface UseRealtimeChatOptions {
    userId: string;
    otherUserId: string;
    enabled?: boolean;
}

interface UseRealtimeChatReturn {
    messages: ChatMessage[];
    connectionStatus: ConnectionStatus;
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    markAsRead: () => Promise<void>;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000; // 1 second

export function useRealtimeChat({
    userId,
    otherUserId,
    enabled = true,
}: UseRealtimeChatOptions): UseRealtimeChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    // Fetch initial messages
    const fetchMessages = useCallback(async () => {
        if (!userId || !otherUserId) return;

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('chat_messages')
                .select('*')
                .or(
                    `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
                )
                .order('timestamp', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            if (isMountedRef.current) {
                setMessages(data || []);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [userId, otherUserId]);

    // Subscribe to realtime messages
    const subscribe = useCallback(() => {
        if (!userId || !otherUserId || !enabled) return;

        // Clean up existing channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }

        setConnectionStatus('connecting');

        const channelName = `chat:${[userId, otherUserId].sort().join('_')}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    // Only add messages that belong to this conversation
                    if (
                        (newMessage.sender_id === userId && newMessage.receiver_id === otherUserId) ||
                        (newMessage.sender_id === otherUserId && newMessage.receiver_id === userId)
                    ) {
                        if (isMountedRef.current) {
                            setMessages((prev) => {
                                // Avoid duplicates
                                if (prev.some((m) => m.id === newMessage.id)) return prev;
                                return [...prev, newMessage];
                            });
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_messages',
                },
                (payload) => {
                    const updatedMessage = payload.new as ChatMessage;
                    if (isMountedRef.current) {
                        setMessages((prev) =>
                            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
                        );
                    }
                }
            )
            .subscribe((status) => {
                if (!isMountedRef.current) return;

                if (status === 'SUBSCRIBED') {
                    setConnectionStatus('connected');
                    reconnectAttemptsRef.current = 0;
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setConnectionStatus('disconnected');
                    scheduleReconnect();
                } else if (status === 'CLOSED') {
                    setConnectionStatus('disconnected');
                }
            });

        channelRef.current = channel;
    }, [userId, otherUserId, enabled]);

    // Exponential backoff reconnection
    const scheduleReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setConnectionStatus('disconnected');
            setError('No se pudo conectar al chat. Por favor, recarga la página.');
            return;
        }

        const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            30000 // max 30 seconds
        );

        reconnectAttemptsRef.current += 1;
        setConnectionStatus('reconnecting');

        reconnectTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                subscribe();
            }
        }, delay);
    }, [subscribe]);

    // Send message with optimistic update
    const sendMessage = useCallback(
        async (text: string) => {
            if (!userId || !otherUserId || !text.trim()) return;

            // Optimistic update
            const optimisticMessage: ChatMessage = {
                id: `optimistic_${Date.now()}`,
                text: text.trim(),
                sender_id: userId,
                receiver_id: otherUserId,
                is_read: false,
                type: 'text',
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            try {
                const { data, error: sendError } = await supabase
                    .from('chat_messages')
                    .insert({
                        text: text.trim(),
                        sender_id: userId,
                        receiver_id: otherUserId,
                        type: 'text',
                        is_read: false,
                    })
                    .select()
                    .single();

                if (sendError) throw sendError;

                // Replace optimistic message with real one
                if (data && isMountedRef.current) {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === optimisticMessage.id ? data : m))
                    );
                }
            } catch (err) {
                // Remove optimistic message on error
                if (isMountedRef.current) {
                    setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
                    setError('Error al enviar el mensaje. Inténtalo de nuevo.');
                }
            }
        },
        [userId, otherUserId]
    );

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!userId || !otherUserId) return;

        const unreadIds = messages
            .filter((m) => m.sender_id === otherUserId && !m.is_read)
            .map((m) => m.id);

        if (unreadIds.length === 0) return;

        try {
            await supabase
                .from('chat_messages')
                .update({ is_read: true })
                .in('id', unreadIds);

            if (isMountedRef.current) {
                setMessages((prev) =>
                    prev.map((m) =>
                        unreadIds.includes(m.id) ? { ...m, is_read: true } : m
                    )
                );
            }
        } catch {
            // Silently fail - not critical
        }
    }, [userId, otherUserId, messages]);

    // Initialize
    useEffect(() => {
        isMountedRef.current = true;

        if (enabled && userId && otherUserId) {
            fetchMessages();
            subscribe();
        }

        return () => {
            isMountedRef.current = false;

            // Cleanup channel
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }

            // Cleanup reconnect timer
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };
    }, [enabled, userId, otherUserId, fetchMessages, subscribe]);

    return {
        messages,
        connectionStatus,
        isLoading,
        error,
        sendMessage,
        markAsRead,
    };
}
