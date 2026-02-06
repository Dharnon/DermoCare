'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Product, RoutineProduct } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';
import { useDermoCareStore } from '@/lib/store';
import { formatDate } from '@/lib/adherence';

interface ProductDetailSheetProps {
    product: Product | RoutineProduct;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailSheet({ product, isOpen, onClose }: ProductDetailSheetProps) {
    const {
        reviews,
        fetchProductReviews,
        addProductReview,
        currentPatient
    } = useDermoCareStore();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'details' | 'reviews'>('info');

    useEffect(() => {
        if (isOpen && product.id) {
            fetchProductReviews(product.id);
        }
    }, [isOpen, product.id, fetchProductReviews]);

    if (!isOpen) return null;

    // Get specific reviews
    const productReviews = reviews.filter(r => r.productId === product.id);
    const averageRating = productReviews.length > 0
        ? (productReviews.reduce((acc, curr) => acc + curr.rating, 0) / productReviews.length).toFixed(1)
        : null;

    const handleSubmitReview = async () => {
        if (!currentPatient || rating === 0) return;

        setIsSubmitting(true);
        try {
            await addProductReview({
                productId: product.id,
                patientId: currentPatient.id,
                rating,
                comment
            });
            setRating(0);
            setComment('');
            setShowReviewForm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Icon colors based on product category
    const iconColors: Record<string, string> = {
        cleanser: 'text-blue-500',
        serum: 'text-orange-500',
        moisturizer: 'text-pink-500',
        sunscreen: 'text-yellow-500',
        treatment: 'text-purple-500',
        other: 'text-gray-500',
    };

    const categoryLabels: Record<string, string> = {
        cleanser: 'Limpiador',
        serum: 'Sérum',
        moisturizer: 'Hidratante',
        sunscreen: 'Protector Solar',
        treatment: 'Tratamiento',
        other: 'Otro',
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            description={categoryLabels[product.category] || product.category}
            className="max-h-[90vh] min-h-[60vh]"
        >
            {/* Header / Image Section */}
            <div className="px-6 pt-2 pb-6 flex flex-col items-center">
                {/* Image Card */}
                <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative overflow-hidden group">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={cn("w-full h-full flex items-center justify-center", product.iconBgColor || 'bg-gray-100')}>
                            <span className={cn("material-symbols-outlined text-6xl", iconColors[product.category] || 'text-gray-400')}>
                                {product.iconName || 'spa'}
                            </span>
                        </div>
                    )}
                    {/* Floating status pill */}
                    {'isCompleted' in product && (
                        <div className="absolute bottom-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {(product as any).isCompleted ? 'Completado' : 'Pendiente'}
                        </div>
                    )}
                </div>

                {/* Title & Info */}
                <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{product.name}</h2>
                    <p className="text-secondary font-medium">{product.description}</p>
                </div>

                {/* Price Mock (Visual Match) */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl font-bold text-[#F4A492]">$42.00</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Insurance Covered</span>
                </div>
            </div>

            <div className="px-6 pb-12 space-y-6">
                {/* Doctor's Instructions Card (Pink) */}
                {('instructions' in product && product.instructions) ? (
                    <div className="bg-[#FFF0ED] rounded-3xl p-6 relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFDCD6] flex items-center justify-center text-[#F47E64]">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">Indicación Médica</h3>
                                <p className="text-[10px] text-[#F47E64] font-bold uppercase">Actualizado hace 3 días</p>
                            </div>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                            "{product.instructions}"
                        </p>
                    </div>
                ) : (
                    // Default instruction if none provided
                    <div className="bg-gray-50 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                <span className="material-symbols-outlined">info</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">Instrucciones</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">General</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {product.applicationMethod || "Aplicar según indicación general de la rutina."}
                        </p>
                    </div>
                )}

                {/* Frequency & Time Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Frecuencia</p>
                        <p className="text-slate-900 font-bold">{product.frequency}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Horario</p>
                        <p className="text-slate-900 font-bold">
                            {/* Infer time from parent data if possible, or generic */}
                            Routine Time
                        </p>
                    </div>
                </div>

                {/* Accordions */}
                <div className="space-y-3">
                    {/* Benefits */}
                    <details className="group bg-white border border-gray-100 rounded-2xl overflow-hidden open:pb-4 transition-all">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">verified</span>
                                <span className="font-bold text-slate-900">Beneficios y Efectos</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="px-4 text-sm text-slate-600 leading-relaxed">
                            {product.benefits && product.benefits.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1">
                                    {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            ) : "Mejora la textura de la piel y unifica el tono."}
                        </div>
                    </details>

                    {/* Ingredients */}
                    <details className="group bg-white border border-gray-100 rounded-2xl overflow-hidden open:pb-4 transition-all">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">science</span>
                                <span className="font-bold text-slate-900">Ingredientes</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="px-4 text-sm text-slate-600 leading-relaxed font-mono bg-gray-50 mx-4 p-3 rounded-xl border border-gray-100">
                            {product.ingredients || "Aqua, Glycerin, Niacinamide, ..."}
                        </div>
                    </details>

                    {/* Side Effects & Safety */}
                    <details className="group bg-white border border-gray-100 rounded-2xl overflow-hidden open:pb-4 transition-all">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">warning</span>
                                <span className="font-bold text-slate-900">Efectos Secundarios</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="px-4 text-sm text-slate-600 leading-relaxed">
                            {product.warnings || "Puede causar ligera irritación inicial. Suspender si persiste."}
                        </div>
                    </details>

                    {/* Reviews Accordion (Preserving Feature) */}
                    <details className="group bg-white border border-gray-100 rounded-2xl overflow-hidden open:pb-4 transition-all">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-400">star</span>
                                <span className="font-bold text-slate-900">Reseñas ({productReviews.length})</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="px-4 pt-2">
                            {/* Review List & Form Integration */}
                            <div className="space-y-4">
                                {!showReviewForm ? (
                                    <button onClick={() => setShowReviewForm(true)} className="w-full py-2 border border-primary text-primary rounded-xl font-bold text-sm">
                                        Escribir Reseña
                                    </button>
                                ) : (
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <div className="flex gap-2 mb-2 justify-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setRating(star)}>
                                                    <span className={cn("material-symbols-outlined", star <= rating ? "text-yellow-400 fill-current" : "text-gray-300")}>star</span>
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full p-2 text-sm rounded-lg mb-2"
                                            placeholder="Tu opinión..."
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowReviewForm(false)} className="flex-1 text-xs py-2">Cancelar</button>
                                            <button onClick={handleSubmitReview} className="flex-1 bg-primary text-white text-xs py-2 rounded-lg font-bold">Enviar</button>
                                        </div>
                                    </div>
                                )}

                                {productReviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-50 pb-2 last:border-0">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-xs">Puntaje: {review.rating}/5</span>
                                            <span className="text-[10px] text-gray-400">{formatDate(new Date(review.createdAt))}</span>
                                        </div>
                                        <p className="text-secondary text-xs mt-1">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </Drawer >
    );
}
