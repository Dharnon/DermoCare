'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';

const slides = [
    {
        title: 'Tu Piel, bajo Control',
        description: 'Sigue cada paso de tu rutina personalizada prescrita por tu dermatólogo.',
        icon: 'spa',
    },
    {
        title: 'Registra tu Progreso',
        description: 'Toma fotos y anota cómo se siente tu piel para que tu doctor siga tu evolución.',
        icon: 'add_a_photo',
    },
    {
        title: 'Comunicación Directa',
        description: 'Resuelve dudas rápidamente a través del chat integrado.',
        icon: 'chat',
    }
];

export default function PatientOnboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            router.push('/patient/dashboard');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFCFB] flex flex-col pt-12 pb-8 px-6">
                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    {/* Progress indicators */}
                    <div className="flex gap-2 justify-center mb-12">
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-neutral-900' : 'w-2 bg-neutral-200'}`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-peach flex items-center justify-center text-white shadow-primary mb-4 transform transition-transform duration-500 hover:scale-105">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {slides[currentSlide].icon}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
                            {slides[currentSlide].title}
                        </h1>
                        <p className="text-neutral-500 text-base leading-relaxed max-w-[280px]">
                            {slides[currentSlide].description}
                        </p>
                    </div>
                </div>

                <div className="mt-auto max-w-sm mx-auto w-full pt-8">
                    <button
                        onClick={handleNext}
                        className="w-full bg-neutral-900 text-white rounded-[1.25rem] py-4.5 text-base font-bold active:scale-[0.97] transition-all shadow-lg shadow-neutral-200"
                    >
                        {currentSlide === slides.length - 1 ? '¡Comenzar!' : 'Siguiente'}
                    </button>
                    {currentSlide < slides.length - 1 && (
                        <button
                            onClick={() => router.push('/patient/dashboard')}
                            className="w-full mt-3 py-3 text-sm font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
                        >
                            Omitir
                        </button>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
