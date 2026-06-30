// src/features/cart/components/QuickAdd.tsx
// T2.7 — Alta rápida por código (evolución de QuickAdd de la maqueta pedido.jsx).
// Maqueta usaba Cart.add(code) sobre un CATALOG hardcodeado; aquí resolvemos el
// Product real (useCatalogLookup) y delegamos en cartStore.addItem, que valida
// stock total (M3). La sucursal la asigna el backend al crear el pedido, por eso
// ya no hay selector de sucursal aquí.

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui';
import { useCatalogLookup } from '../hooks/useCatalogLookup';
import { useCartActions } from '../hooks/useCart';

const minus = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
);
const cartIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
    </svg>
);

export function QuickAdd() {
    const [code, setCode] = useState('');
    const [qty, setQty] = useState(1);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const { addItem } = useCartActions();
    const { findByCode, productos, isLoading } = useCatalogLookup();

    const ejemplos = productos.slice(0, 4).map((p) => p.code);

    const submit = (e?: FormEvent) => {
        if (e) e.preventDefault();
        const product = findByCode(code);
        if (!product) {
            setMsg({
                ok: false,
                text: isLoading ? 'Cargando catálogo, intenta de nuevo…' : 'Código no encontrado en el catálogo.',
            });
            return;
        }
        const r = addItem(product, qty);
        if (r.ok) {
            setMsg({ ok: true, text: `Agregado: ${product.name}` });
            setCode('');
            setQty(1);
        } else {
            setMsg({ ok: false, text: r.error ?? 'No se pudo agregar el producto.' });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-card ring-gold overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-plum-700 text-white">
                <span className="font-display font-bold text-[20px]">Suministros</span>
                <span className="text-gold-300">{minus}</span>
            </div>

            <form onSubmit={submit} className="p-4">
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Código del producto</label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ej. 1325149"
                            className="w-full text-[14px]"
                        />
                    </div>
                    <div className="w-16">
                        <label className="block text-[11.5px] font-bold text-grape-700 mb-1">Cant.</label>
                        <Input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full text-[14px] text-center"
                        />
                    </div>
                    <button
                        type="submit"
                        aria-label="Agregar al carrito"
                        className="h-[38px] w-[42px] grid place-items-center rounded-lg bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 transition-colors"
                    >
                        {cartIcon}
                    </button>
                </div>

                {msg && (
                    <p className={`mt-2 text-[12px] font-semibold ${msg.ok ? 'text-grape-600' : 'text-rose-600'}`}>
                        {msg.text}
                    </p>
                )}

                {ejemplos.length > 0 && (
                    <p className="mt-3 text-[11.5px] text-grape-500 leading-relaxed">
                        Códigos de ejemplo:{' '}
                        {ejemplos.map((c, i) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCode(c)}
                                className="font-mono text-gold-600 hover:text-plum-700 mr-1"
                            >
                                {c}{i < ejemplos.length - 1 ? ',' : ''}
                            </button>
                        ))}
                    </p>
                )}
            </form>
        </div>
    );
}