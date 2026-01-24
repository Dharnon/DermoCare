'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface ProductSheetProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { value: 'cleanser', label: 'Limpiador', color: 'bg-blue-50 text-blue-600' },
    { value: 'serum', label: 'Sérum', color: 'bg-orange-50 text-orange-600' },
    { value: 'moisturizer', label: 'Hidratante', color: 'bg-pink-50 text-pink-600' },
    { value: 'sunscreen', label: 'Protector Solar', color: 'bg-yellow-50 text-yellow-600' },
    { value: 'treatment', label: 'Tratamiento', color: 'bg-purple-50 text-purple-600' },
    { value: 'other', label: 'Otro', color: 'bg-gray-50 text-gray-600' },
];

const ICONS = [
    'water_drop', 'flare', 'face', 'sunny', 'visibility', 'soap', 'clean_hands',
    'spa', 'sanitizer', 'healing', 'medication', 'lotion'
];

export function ProductSheet({ product, isOpen, onClose }: ProductSheetProps) {
    const { addProduct, updateProduct, deleteProduct } = useDermoCareStore();

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Product['category']>('cleanser');
    const [iconName, setIconName] = useState('spa');
    const [frequency, setFrequency] = useState('');
    const [applicationMethod, setApplicationMethod] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (product) {
                // Edit Mode
                setName(product.name);
                setDescription(product.description);
                setCategory(product.category);
                setIconName(product.iconName || 'spa');
                setFrequency(product.frequency);
                setApplicationMethod(product.applicationMethod);
            } else {
                // Create Mode (Reset)
                setName('');
                setDescription('');
                setCategory('cleanser');
                setIconName('spa');
                setFrequency('Dos veces al día');
                setApplicationMethod('Aplicar en rostro limpio');
            }
        }
    }, [isOpen, product]);

    const handleSave = () => {
        if (!name.trim()) return;

        const productData = {
            name,
            description,
            category,
            iconName,
            iconBgColor: CATEGORIES.find(c => c.value === category)?.color,
            frequency,
            applicationMethod,
        };

        if (product) {
            updateProduct(product.id, productData);
        } else {
            addProduct({ ...productData, imageUrl: '' } as Omit<Product, 'id'>);
        }
        onClose();
    };

    const handleDelete = () => {
        if (product && confirm('¿Eliminar este producto del inventario? Se eliminará de todas las rutinas activas.')) {
            deleteProduct(product.id);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={product ? 'Editar Producto' : 'Nuevo Producto'}
            description={product ? 'Modificar detalles del producto' : 'Añadir un nuevo producto al inventario'}
        >
            <div className="pb-12 pt-4">
                <div className="mb-6 flex justify-between items-center">
                    {product && (
                        <button
                            onClick={handleDelete}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors z-20"
                        >
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Gel Limpiador Suave"
                            className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción del producto"
                            className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Categoría</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value as Product['category'])}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                                        category === cat.value
                                            ? cn(cat.color, "border-transparent shadow-sm")
                                            : "bg-white text-neutral-500 border-neutral-200"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Icono</label>
                        <div className="grid grid-cols-6 gap-2">
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => setIconName(icon)}
                                    className={cn(
                                        "aspect-square rounded-xl flex items-center justify-center transition-all",
                                        iconName === icon
                                            ? "bg-primary text-white shadow-md shadow-primary/30"
                                            : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                    )}
                                >
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Frecuencia</label>
                            <input
                                type="text"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                placeholder="Ej: Dos veces al día"
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Método de uso</label>
                            <textarea
                                value={applicationMethod}
                                onChange={(e) => setApplicationMethod(e.target.value)}
                                placeholder="Ej: Aplicar sobre piel húmeda..."
                                className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all mt-4",
                            name.trim() ? "bg-primary shadow-primary/30 active:scale-[0.98]" : "bg-neutral-300 shadow-none cursor-not-allowed"
                        )}
                    >
                        {product ? 'Guardar Cambios' : 'Añadir Producto'}
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
