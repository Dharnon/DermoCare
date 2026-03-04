'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage, User } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    currentUser: User;
    otherUser: { name: string; avatarUrl?: string; specialization?: string; bio?: string };
    onSendMessage: (text: string) => void;
    className?: string;
    showHeader?: boolean;
    quickFaqs?: string[];
}

// Helper to group messages by date
function groupMessagesByDate(messages: ChatMessage[]) {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    for (const msg of messages) {
        const msgDate = new Date(msg.timestamp).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groups.push({ date: msgDate, messages: [msg] });
        } else {
            groups[groups.length - 1].messages.push(msg);
        }
    }

    return groups;
}

// Get relative date label
function getDateLabel(dateStr: string): string {
    const today = new Date();
    const msgDate = new Date(dateStr);

    const isToday = today.toDateString() === msgDate.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === msgDate.toDateString();

    if (isToday) return 'HOY';
    if (isYesterday) return 'AYER';

    return dateStr.toUpperCase();
}

export function ChatInterface({
    messages,
    currentUser,
    otherUser,
    onSendMessage,
    className,
    showHeader = true,
    quickFaqs = ['Consejos retinol', 'Efectos secundarios', 'Consejos SPF']
}: ChatInterfaceProps) {
    const [inputText, setInputText] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [showConsultationCTA, setShowConsultationCTA] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

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

    const handleQuickFaq = (faq: string) => {
        onSendMessage(`¿Puedes darme información sobre ${faq.toLowerCase()}?`);
    };

    return (
        <div className={cn("flex flex-col h-full bg-[#FDFCFB]", className)}>

            {/* Premium Header */}
            {showHeader && (
                <div className="bg-white px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity"
                        onClick={() => setShowDetails(true)}
                    >
                        <button 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
                            aria-label="Volver"
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                        </button>
                        <div>
                            <h2 className="font-bold text-neutral-900 text-base leading-tight">Clinic Chat</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <p className="text-xs text-neutral-500 uppercase tracking-wide">
                                    {otherUser.name} • Online
                                </p>
                            </div>
                        </div>
                    </div>
                    <button 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
                        aria-label="Más opciones"
                    >
                        <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                </div>
            )}

            {/* Quick FAQs */}
            {quickFaqs.length > 0 && (
                <div className="px-4 py-3 bg-white border-b border-neutral-100">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-2">Preguntas Rápidas</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {quickFaqs.map((faq, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickFaq(faq)}
                                className="flex-shrink-0 px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700 font-medium hover:border-primary hover:text-primary transition-colors bg-white"
                            >
                                {faq}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-neutral-300">chat_bubble_outline</span>
                        </div>
                        <p className="text-sm font-medium">Inicia la conversación</p>
                        <p className="text-xs mt-1 text-center max-w-[200px]">
                            Pregunta sobre tu tratamiento o rutina de cuidado.
                        </p>
                    </div>
                ) : (
                    messageGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-3">
                            {/* Date Separator */}
                            <div className="flex justify-center">
                                <span className="text-[11px] font-semibold text-primary tracking-wider uppercase bg-primary/5 px-3 py-1 rounded-full">
                                    {getDateLabel(group.messages[0].timestamp)}
                                </span>
                            </div>

                            {/* Messages */}
                            {group.messages.map((msg) => {
                                const isMe = msg.senderId === currentUser.id;
                                const isImage = msg.type === 'image';

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full gap-2",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {/* Other User Avatar */}
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-neutral-100 flex items-center justify-center mt-auto">
                                                {otherUser.avatarUrl ? (
                                                    <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-neutral-400 text-lg">person</span>
                                                )}
                                            </div>
                                        )}

                                        <div className={cn("max-w-[75%] flex flex-col", isMe ? "items-end" : "items-start")}>
                                            {/* Message Bubble */}
                                            {isImage ? (
                                                <div className="rounded-2xl overflow-hidden shadow-sm relative">
                                                    <img
                                                        src={msg.text}
                                                        alt="Foto"
                                                        className="max-w-full max-h-64 object-cover"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                                        <span className="text-white text-xs font-medium uppercase tracking-wide">Progreso Actual</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                                        isMe
                                                            ? "bg-primary text-white rounded-br-md"
                                                            : "bg-white text-neutral-800 rounded-bl-md border border-neutral-100"
                                                    )}
                                                >
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <div className={cn(
                                                "text-[10px] mt-1.5 flex items-center gap-1 text-neutral-400",
                                                isMe ? "flex-row-reverse" : ""
                                            )}>
                                                <span>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span className={cn(
                                                        "material-symbols-outlined text-sm",
                                                        msg.isRead ? "text-primary" : "text-neutral-300"
                                                    )}>
                                                        done_all
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}

                {/* Consultation CTA */}
                {showConsultationCTA && messages.length > 3 && (
                    <div className="bg-gradient-to-br from-primary/5 to-peach-light rounded-3xl p-5 mt-4 relative overflow-hidden">
                        <button
                            onClick={() => setShowConsultationCTA(false)}
                            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">videocam</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-neutral-900 text-sm">¿Necesitas más detalles?</h4>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Reserva una videoconsulta de 15 min con {otherUser.name.split(' ')[0]}
                                </p>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark transition-colors">
                            Solicitar Consulta
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white px-4 py-3 border-t border-neutral-100 safe-area-bottom">
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">
                        <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                    <div className="flex-1 bg-neutral-100 rounded-full px-4 py-3 flex items-center">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            inputText.trim()
                                ? "bg-primary text-white shadow-lg shadow-primary/30 active:scale-95"
                                : "bg-neutral-100 text-neutral-400"
                        )}
                    >
                        <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                </div>
            </div>

            {/* Doctor Details Drawer */}
            <Drawer
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                title="Información del Especialista"
                className="min-h-[50vh]"
            >
                <div className="flex flex-col items-center pt-6 pb-12">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                        {otherUser.avatarUrl ? (
                            <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{otherUser.name}</h2>
                    <p className="text-primary font-medium text-sm mb-6">{otherUser.specialization || 'Dermatólogo'}</p>

                    <div className="w-full space-y-4 px-2">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <h3 className="font-bold text-slate-800 text-sm mb-2 opacity-70 uppercase tracking-wider">Sobre mí</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {otherUser.bio || 'Dermatólogo certificado con experiencia en tratamiento de acné, melasma y rejuvenecimiento facial. Comprometida con tu salud dermatológica.'}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 text-slate-700 mb-2">
                                <span className="material-symbols-outlined text-green-500">schedule</span>
                                <span className="font-bold text-sm">Horario de Atención</span>
                            </div>
                            <p className="text-slate-600 text-sm">Lunes - Viernes: 9:00 - 18:00</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-2xl text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined">call</span>
                                Llamar
                            </button>
                            <button className="flex items-center justify-center gap-2 p-4 bg-emerald-50 rounded-2xl text-emerald-600 font-medium text-sm hover:bg-emerald-100 transition-colors">
                                <span className="material-symbols-outlined">videocam</span>
                                Video
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDetails(false)}
                        className="mt-8 text-neutral-500 font-medium text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </Drawer>
        </div>
    );
}
