-- ============================================================
-- DermoCare: chat_messages table migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON public.chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(sender_id, receiver_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.chat_messages;

-- Policy: Users can read messages where they are sender or receiver
CREATE POLICY "Users can read their own messages"
    ON public.chat_messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Policy: Authenticated users can send messages
CREATE POLICY "Users can send messages"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

-- Policy: Receivers can mark messages as read
CREATE POLICY "Users can mark messages as read"
    ON public.chat_messages
    FOR UPDATE
    USING (
        auth.uid() = receiver_id
    )
    WITH CHECK (
        auth.uid() = receiver_id
    );

-- Enable Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Grant permissions
GRANT ALL ON public.chat_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
