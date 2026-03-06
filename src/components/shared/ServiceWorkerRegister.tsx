'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        if (process.env.NODE_ENV !== 'production') {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister();
                });
            }).catch(() => {
                // Ignore cleanup failures in development
            });

            caches.keys().then((keys) => {
                keys.forEach((key) => {
                    caches.delete(key);
                });
            }).catch(() => {
                // Ignore cache cleanup failures in development
            });

            return;
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .catch(() => {
                    // Service worker registration failed silently
                });
        }
    }, []);

    return null;
}
