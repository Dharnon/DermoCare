'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { cn } from '@/lib/utils';
import { ProductSheet } from '@/features/doctor/components/ProductSheet';
import type { Product } from '@/lib/types';

const CATEGORIES = [
    { value: 'all', label: 'Todos' },
    { value: 'cleanser', label: 'Limpiadores' },
    { value: 'serum', label: 'Sérums' },
    { value: 'moisturizer', label: 'Hidratantes' },
    { value: 'sunscreen', label: 'Solares' },
    { value: 'treatment', label: 'Tratamientos' },
    { value: 'other', label: 'Otros' },
];

export default function InventoryPage() {
    const { products } = useDermoCareStore();
    const { setFab, hideFab } = useUIStore();
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Set global FAB action on mount
    useEffect(() => {
        setFab(() => {
            setSelectedProduct(null);
            setIsSheetOpen(true);
        }, 'add');

        return () => hideFab();
    }, [setFab, hideFab]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, filterCategory]);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsSheetOpen(true);
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32">
            <header className="px-6 pt-12 pb-2">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/doctor/tools" className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-600 active:scale-90 transition-transform shadow-sm">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Inventario</h1>
                        <p className="text-secondary text-sm">Gestiona tu catálogo de productos</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-neutral-400">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                filterCategory === cat.value
                                    ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/20"
                                    : "bg-white text-neutral-500 border border-neutral-100"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="px-6 space-y-3">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => handleEdit(product)}
                        className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm active:scale-[0.99] transition-all flex items-center gap-4 cursor-pointer"
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            product.iconBgColor || "bg-neutral-100"
                        )}>
                            <span className="material-symbols-outlined text-xl">
                                {product.iconName || 'spa'}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-900 truncate">{product.name}</h3>
                            <p className="text-xs text-secondary truncate">{product.description}</p>
                        </div>

                        <span className="material-symbols-outlined text-neutral-300">edit</span>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                        <p>No se encontraron productos</p>
                    </div>
                )}
            </div>

            <ProductSheet
                product={selectedProduct}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
        </div>
    );
}
