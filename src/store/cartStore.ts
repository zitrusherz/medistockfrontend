// src/store/cartStore.ts
// T0.8 ⭐ — Carrito. Patrón: Observer + Singleton (Zustand) · persist (M).
// Reemplaza el objeto `Cart` de la maqueta (store.js): se descarta CATALOG hardcodeado,
// el producto llega del catálogo de la API, valida stock (M3) y desglosa IVA (M1/M2).
//
// Capas: este store NO llama a axios. La página/feature obtiene el Product (catalogService,
// T2.1) y lo pasa a addItem. El handoff toDetalles() alimenta el checkout (T2.8).

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/types/models';
import type { CartItem, AddItemResult, CartTotals } from '@/features/cart/types';
import type { NuevoDetalle } from '@/features/orders/types/index.ts';

interface CartState {
    items: CartItem[];
    sucursalId: number | null; // un carrito = una sola sucursal
}

interface CartActions {
    // Mutaciones (evolución de add/setQty/remove/clear de la maqueta)
    addItem: (product: Product, qty: number, sucursalId: number) => AddItemResult;
    setQty: (code: string, qty: number) => void;
    removeItem: (code: string) => void;
    clear: () => void;

    // Selectores derivados
    count: () => number;
    subtotalNeto: () => number; // antes `subtotal()`; ahora explícitamente NETO
    totalEstimado: () => CartTotals;

    // Handoff hacia el checkout (T2.8): arma detalles[] de POST /orders/pedidos/
    toDetalles: () => NuevoDetalle[];
}

export type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            sucursalId: null,

            /* ── AGREGAR ──────────────────────────────────────────────────────── */
            addItem: (product, qty, sucursalId) => {
                const cantidad = Math.max(1, Math.trunc(qty) || 1);
                const { items, sucursalId: actual } = get();

                // Regla: un carrito sólo puede tener productos de una sucursal.
                if (actual !== null && actual !== sucursalId) {
                    return {
                        ok: false,
                        error:
                            'Tu carrito ya tiene productos de otra sucursal. Vacíalo para cambiar de sucursal.',
                    };
                }

                // M3: el stock viene del Product que entregó el catálogo (no de un mock).
                // stockBySucursal es un array, así que buscamos la sucursal correspondiente
                const stockObj = product.stockBySucursal?.find((s) => s.sucursalId === sucursalId);
                const stockDisponible = stockObj?.stock ?? 0;
                if (stockDisponible <= 0) {
                    return { ok: false, error: 'Producto sin stock en esta sucursal.' };
                }

                const existente = items.find((i) => i.code === product.code);
                const cantidadTotal = (existente?.quantity ?? 0) + cantidad;
                if (cantidadTotal > stockDisponible) {
                    return {
                        ok: false,
                        error: `Stock insuficiente. Disponible en esta sucursal: ${stockDisponible}.`,
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
                    };
                    return { items: [...state.items, nuevo], sucursalId };
                });

                return { ok: true };
            },

            /* ── EDITAR CANTIDAD ──────────────────────────────────────────────── */
            setQty: (code, qty) =>
                set((state) => {
                    const cantidad = Math.trunc(qty) || 0;
                    if (cantidad <= 0) {
                        const items = state.items.filter((i) => i.code !== code);
                        return { items, sucursalId: items.length ? state.sucursalId : null };
                    }
                    return {
                        items: state.items.map((i) =>
                            // nunca supera el stock capturado al agregar
                            i.code === code ? { ...i, quantity: Math.min(cantidad, i.stockMax) } : i,
                        ),
                    };
                }),

            /* ── ELIMINAR / VACIAR ────────────────────────────────────────────── */
            removeItem: (code) =>
                set((state) => {
                    const items = state.items.filter((i) => i.code !== code);
                    return { items, sucursalId: items.length ? state.sucursalId : null };
                }),

            clear: () => set({ items: [], sucursalId: null }),

            /* ── SELECTORES (devuelven primitivos → seguros como selector) ─────── */
            count: () => get().items.reduce((s, i) => s + i.quantity, 0),

            subtotalNeto: () => get().items.reduce((s, i) => s + i.priceNeto * i.quantity, 0),

            // Objeto nuevo en cada llamada: consumir vía useCartTotal() (useMemo), no
            // como selector directo en un componente (rompería la igualdad de Zustand).
            totalEstimado: () => {
                const items = get().items;
                const neto = items.reduce((s, i) => s + i.priceNeto * i.quantity, 0);
                const total = items.reduce((s, i) => s + i.priceIva * i.quantity, 0);
                return {
                    neto,
                    iva: total - neto,
                    total,
                };
            },

            /* ── HANDOFF CHECKOUT (T2.8) ──────────────────────────────────────── */
            toDetalles: () =>
                get().items.map((i) => ({ producto_id: i.productId, cantidad: i.quantity })),
        }),
        {
            name: 'medistock-cart-v1',
            version: 1,
            storage: createJSONStorage(() => localStorage),
            // Sólo se persiste el estado serializable (no las funciones).
            partialize: (state) => ({ items: state.items, sucursalId: state.sucursalId }),
        },
    ),
);