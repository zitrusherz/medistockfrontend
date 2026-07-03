

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/types/models';
import type { CartItem, AddItemResult, CartTotals } from '@/features/cart/types';
import type { NuevoDetalle } from '@/features/orders/types/index.ts';

interface CartState {
    items: CartItem[];
}

interface CartActions {
    addItem: (product: Product, qty: number) => AddItemResult;
    setQty: (code: string, qty: number) => void;
    removeItem: (code: string) => void;
    clear: () => void;

    count: () => number;
    subtotalNeto: () => number;
    totalEstimado: () => CartTotals;

    toDetalles: () => NuevoDetalle[];
}

export type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            /* ── AGREGAR ──────────────────────────────────────────────────────── */
            addItem: (product, qty) => {
                const cantidad = Math.max(1, Math.trunc(qty) || 1);
                const { items } = get();

                const stockDisponible = product.stockTotal ?? 0;
                if (stockDisponible <= 0) {
                    return { ok: false, error: 'Producto sin stock disponible.' };
                }

                const existente = items.find((i) => i.code === product.code);
                const cantidadTotal = (existente?.quantity ?? 0) + cantidad;
                if (cantidadTotal > stockDisponible) {
                    return {
                        ok: false,
                        error: `Stock insuficiente. Disponible: ${stockDisponible}.`,
                    };
                }

                set((state) => {
                    if (existente) {
                        return {
                            items: state.items.map((i) =>
                                i.code === product.code
                                    ? { ...i, quantity: cantidadTotal, stockMax: stockDisponible }
                                    : i,
                            ),
                        };
                    }
                    const nuevo: CartItem = {
                        productId: product.id,
                        code: product.code,
                        name: product.name,
                        unit: product.unit,
                        priceNeto: product.priceNeto,
                        priceIva: product.priceIva,
                        stockMax: stockDisponible,
                        quantity: cantidad,
                        imageUrl: product.imageUrl ?? null, // foto para mini-carrito / fila
                    };
                    return { items: [...state.items, nuevo] };
                });

                return { ok: true };
            },

            /* ── EDITAR CANTIDAD ──────────────────────────────────────────────── */
            setQty: (code, qty) =>
                set((state) => {
                    const cantidad = Math.trunc(qty) || 0;
                    if (cantidad <= 0) {
                        return { items: state.items.filter((i) => i.code !== code) };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.code === code ? { ...i, quantity: Math.min(cantidad, i.stockMax) } : i,
                        ),
                    };
                }),

            /* ── ELIMINAR / VACIAR ────────────────────────────────────────────── */
            removeItem: (code) =>
                set((state) => ({ items: state.items.filter((i) => i.code !== code) })),

            clear: () => set({ items: [] }),

            /* ── SELECTORES ───────────────────────────────────────────────────── */
            count: () => get().items.reduce((s, i) => s + i.quantity, 0),

            subtotalNeto: () => get().items.reduce((s, i) => s + i.priceNeto * i.quantity, 0),

            totalEstimado: () => {
                const items = get().items;
                const neto = items.reduce((s, i) => s + i.priceNeto * i.quantity, 0);
                const total = items.reduce((s, i) => s + i.priceIva * i.quantity, 0);
                return { neto, iva: total - neto, total };
            },

            /* ── HANDOFF CHECKOUT (T2.8) ──────────────────────────────────────── */
            toDetalles: () =>
                get().items.map((i) => ({ producto_id: i.productId, cantidad: i.quantity })),
        }),
        {
            name: 'medistock-cart-v2',
            version: 2,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),
        },
    ),
);