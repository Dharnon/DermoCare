'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useDermoCareStore } from '@/lib/store';
import { useUIStore } from '@/lib/ui-store';
import { cn } from '@/lib/utils';
import { ProductSheet } from '@/features/doctor/components/ProductSheet';
import type { Product } from '@/lib/types';

const DEFAULT_CATEGORIES: Record<string, string> = {
    'cleanser': 'Limpiadores',
    'serum': 'Sérums',
    'moisturizer': 'Hidratantes',
    'sunscreen': 'Solares',
    'treatment': 'Tratamientos',
    'other': 'Otros',
};

export default function InventoryPage() {
    const { products } = useDermoCareStore();
    const { setFab, hideFab } = useUIStore();
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Dynamic Categories
    const categories = useMemo(() => {
        const uniqueCategories = new Set(products.map(p => p.category));

        // Add defaults if they are missing (to ensure structure) but actually we want all defaults + extra
        Object.keys(DEFAULT_CATEGORIES).forEach(k => uniqueCategories.add(k));

        const catList = [{ value: 'all', label: 'Todos' }];

        // Convert to array and sort (defaults first determined by hardcoded list order if likely, or just alpha)
        // Here we just iterate our known list for order, then append others
        const sortedKeys = Array.from(uniqueCategories);

        // Prioritize default order
        const defaultKeys = Object.keys(DEFAULT_CATEGORIES);

        // Sort: defaults in order, then others alphabetically
        sortedKeys.sort((a, b) => {
            const idxA = defaultKeys.indexOf(a);
            const idxB = defaultKeys.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach(key => {
            catList.push({
                value: key,
                label: DEFAULT_CATEGORIES[key] || (key.charAt(0).toUpperCase() + key.slice(1))
            });
        });

        return catList;
    }, [products]);

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
                p.description.toLowerCase().includes(search.toLowerCase()) ||
                (p.brand?.toLowerCase().includes(search.toLowerCase()) || false);
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
                        placeholder="Buscar por nombre, marca..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map((cat) => (
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
                            {product.brand && (
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-0.5">{product.brand}</p>
                            )}
                            <h3 className="font-bold text-neutral-900 truncate">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase",
                                    DEFAULT_CATEGORIES[product.category] ? "bg-neutral-100 text-neutral-500" : "bg-primary/10 text-primary"
                                )}>
                                    {DEFAULT_CATEGORIES[product.category] || product.category}
                                </span>
                                {product.price && (
                                    <span className="text-xs font-semibold text-neutral-900">{product.price}</span>
                                )}
                            </div>
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
