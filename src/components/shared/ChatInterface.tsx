'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage, User } from '@/lib/types';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    currentUser: User;
    otherUser: { name: string; avatarUrl?: string };
    onSendMessage: (text: string) => void;
    className?: string;
}

export function ChatInterface({
    messages,
    currentUser,
    otherUser,
    onSendMessage,
    className
}: ChatInterfaceProps) {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-[#E5DDD5]", className)}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 opacity-60">
                        <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                        <p className="text-sm">Inicia la conversación</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full mb-2",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] px-3 py-2 rounded-lg text-sm relative shadow-sm",
                                        isMe
                                            ? "bg-[#DCF8C6] text-black rounded-tr-none"
                                            : "bg-white text-black rounded-tl-none"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap leading-tight">{msg.text}</p>
                                    <div className={cn(
                                        "text-[10px] mt-1 flex items-center gap-1 opacity-60",
                                        isMe ? "justify-end" : "justify-start"
                                    )}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <span className={cn(
                                                "material-symbols-outlined text-[14px]",
                                                msg.isRead ? "text-blue-500" : "text-neutral-400"
                                            )}>
                                                done_all
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#F0F2F5] px-4 py-2 flex items-center gap-2 safe-area-bottom">
                <button className="text-neutral-500 p-2 rounded-full hover:bg-black/5 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">add</span>
                </button>
                <div className="flex-1 bg-white rounded-full px-4 py-2 shadow-sm flex items-center">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje"
                        className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                    />
                </div>
                {inputText.trim() ? (
                    <button
                        onClick={handleSend}
                        className="w-10 h-10 bg-[#00A884] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                ) : (
                    <button className="text-neutral-500 p-2 rounded-full hover:bg-black/5 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined">mic</span>
                    </button>
                )}
            </div>
        </div>
    );
}
