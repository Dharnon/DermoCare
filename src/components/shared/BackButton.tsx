'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-500 active:bg-neutral-100 transition-colors"
        >
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
    );
}
