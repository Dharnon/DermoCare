'use client';

import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Wrapper to standardise Drawer behavior across the app
interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string; // Content wrapper class
    bodyClassName?: string; // Body wrapper class
}

export function Drawer({ isOpen, onClose, children, title, description, className, bodyClassName }: DrawerProps) {
    // Prevent hydration mismatch or issues with mounting
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <VaulDrawer.Root
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            shouldScaleBackground
        >
            <VaulDrawer.Portal>
                {/* Backdrop */}
                <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />

                {/* Content */}
                <VaulDrawer.Content
                    className={cn(
                        "bg-white flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none max-h-[94%] shadow-[0_-4px_30px_rgba(0,0,0,0.1)]",
                        className
                    )}
                >
                    {/* Handle & Header */}
                    <div className="p-4 bg-white rounded-t-[2rem] flex-shrink-0 z-10 w-full relative">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-4" />
                        {(title || description) && (
                            <div className="mx-auto text-center pb-2 px-6">
                                {title && <VaulDrawer.Title className="font-bold text-lg mb-1">{title}</VaulDrawer.Title>}
                                {description && <VaulDrawer.Description className="text-secondary text-sm">{description}</VaulDrawer.Description>}
                            </div>
                        )}
                        {!title && (
                            <VaulDrawer.Title className="sr-only">
                                Panel de Detalles
                            </VaulDrawer.Title>
                        )}
                    </div>

                    {/* Body */}
                    <div className={cn("flex-1 overflow-y-auto p-6 pt-0 w-full", bodyClassName)}>
                        {children}
                    </div>
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
}
