'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDermoCareStore } from '@/lib/store';
import type { RoutineTemplate, Product } from '@/lib/types';
import { Drawer } from '@/components/shared/Drawer';

interface EditTemplateSheetProps {
    template: RoutineTemplate | null;
    isOpen: boolean;
    onClose: () => void;
}

const ICONS = [
    { name: 'spa', label: 'Rutina General' },
    { name: 'clean_hands', label: 'Limpieza' },
    { name: 'face_retouching_natural', label: 'Anti-edad' },
    { name: 'water_drop', label: 'Hidratación' },
    { name: 'wb_sunny', label: 'Día' },
    { name: 'bedtime', label: 'Noche' },
    { name: 'healing', label: 'Reparación' },
    { name: 'sanitizer', label: 'Acné' },
];

export function EditTemplateSheet({ template, isOpen, onClose }: EditTemplateSheetProps) {
    const { deleteTemplate, updateTemplate, addTemplate, products: allProducts } = useDermoCareStore();

    // Core state
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('spa');
    const [scheduleType, setScheduleType] = useState<'am' | 'pm'>('am');

    // Products in template (Local state for editing)
    const [templateProducts, setTemplateProducts] = useState<{ productId: string, instructions: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (template) {
                setName(template.name);
                setSelectedIcon(template.icon);
                setScheduleType(template.scheduleType);
                // In the current mock, template.products is just string[]. 
                // We'll need to upgrade this eventually, but for now let's map it.
                setTemplateProducts(template.products.map(pId => ({
                    productId: pId,
                    instructions: '' // Placeholder for now
                })));
            } else {
                setName('');
                setSelectedIcon('spa');
                setScheduleType('am');
                setTemplateProducts([]);
            }
        }
    }, [template, isOpen]);

    const handleSave = () => {
        if (!name.trim()) return;

        const data = {
            name,
            icon: selectedIcon,
            scheduleType,
            products: templateProducts.map(tp => tp.productId)
        };

        if (template) {
            updateTemplate(template.id, data);
        } else {
            addTemplate(data);
        }
        onClose();
    };

    const addProduct = (p: Product) => {
        if (templateProducts.find(tp => tp.productId === p.id)) return;
        setTemplateProducts([...templateProducts, { productId: p.id, instructions: p.applicationMethod }]);
        setIsSearching(false);
        setSearchQuery('');
    };

    const removeProduct = (productId: string) => {
        setTemplateProducts(templateProducts.filter(tp => tp.productId !== productId));
    };

    const updateInstruction = (productId: string, instr: string) => {
        setTemplateProducts(templateProducts.map(tp =>
            tp.productId === productId ? { ...tp, instructions: instr } : tp
        ));
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !templateProducts.find(tp => tp.productId === p.id)
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={template ? 'Editar Plantilla' : 'Nueva Plantilla'}
            description={template ? 'Modificar nombre, icono y productos' : 'Crear plantilla desde cero'}
        >
            <div className="pb-12 space-y-8">
                {/* Header Info */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">General</label>
                        <div className="flex bg-neutral-100 p-1 rounded-full scale-90 origin-right">
                            <button
                                onClick={() => setScheduleType('am')}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                                    scheduleType === 'am' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-400"
                                )}
                            >AM</button>
                            <button
                                onClick={() => setScheduleType('pm')}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                                    scheduleType === 'pm' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-400"
                                )}
                            >PM</button>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre de la plantilla"
                        className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg"
                    />
                    <div className="grid grid-cols-4 gap-2">
                        {ICONS.map((icon) => (
                            <button
                                key={icon.name}
                                onClick={() => setSelectedIcon(icon.name)}
                                className={cn(
                                    "flex items-center justify-center py-3 rounded-2xl border transition-all",
                                    selectedIcon === icon.name ? "bg-primary border-primary text-white shadow-md" : "bg-neutral-50 border-neutral-100 text-neutral-400"
                                )}
                            >
                                <span className="material-symbols-outlined">{icon.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Productos Incluidos</label>
                        <button
                            onClick={() => setIsSearching(true)}
                            className="text-xs font-bold text-primary flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Añadir Producto
                        </button>
                    </div>

                    {/* Product List */}
                    <div className="space-y-3">
                        {templateProducts.length === 0 ? (
                            <div className="p-8 text-center bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-100">
                                <p className="text-sm text-neutral-400">No hay productos en esta plantilla</p>
                            </div>
                        ) : (
                            templateProducts.map((tp, index) => {
                                const product = allProducts.find(p => p.id === tp.productId);
                                if (!product) return null;
                                return (
                                    <div key={tp.productId} className="bg-white border border-neutral-100 p-4 rounded-3xl space-y-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center opacity-80", product.iconBgColor)}>
                                                <span className="material-symbols-outlined text-xl">{product.iconName}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-neutral-900">{product.name}</h4>
                                                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{product.category}</p>
                                            </div>
                                            <button onClick={() => removeProduct(tp.productId)} className="text-neutral-300 hover:text-red-400 transition-colors">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-neutral-400 uppercase ml-1 mb-1 block">Instrucciones Específicas</label>
                                            <textarea
                                                value={tp.instructions}
                                                onChange={(e) => updateInstruction(tp.productId, e.target.value)}
                                                className="w-full text-xs bg-neutral-50 p-3 rounded-xl border-none focus:ring-1 focus:ring-primary/20 min-h-[60px] resize-none"
                                                placeholder="Ej: Aplicar solo en zonas con acné..."
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-2">
                    {template && (
                        <button
                            onClick={() => { if (confirm('¿Eliminar plantilla?')) { deleteTemplate(template.id); onClose(); } }}
                            className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Eliminar
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        className="flex-[2] py-4 bg-neutral-900 text-white rounded-2xl font-bold shadow-xl shadow-neutral-200 active:scale-95 transition-all"
                    >
                        {template ? 'Guardar Cambios' : 'Crear Plantilla'}
                    </button>
                </div>
            </div>

            {/* Product Search Overlay */}
            {isSearching && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Añadir Producto</h3>
                        <button onClick={() => setIsSearching(false)} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="relative mb-6">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">search</span>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {filteredProducts.map(p => (
                            <button
                                key={p.id}
                                onClick={() => addProduct(p)}
                                className="w-full flex items-center gap-4 bg-white border border-neutral-100 p-4 rounded-3xl hover:border-primary/30 transition-all text-left"
                            >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", p.iconBgColor)}>
                                    <span className="material-symbols-outlined">{p.iconName}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-neutral-900">{p.name}</h4>
                                    <p className="text-xs text-neutral-400">{p.description}</p>
                                </div>
                                <span className="material-symbols-outlined text-neutral-300">add_circle</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Drawer>
    );
}

