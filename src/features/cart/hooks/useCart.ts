// src/features/cart/hooks/useCart.ts
// T0.8 — Hooks de consumo del carrito (Observer vía Zustand).
// Cada hook selecciona el mínimo slice posible para evitar re-renders innecesarios.

import { useMemo } from 'react';
import { calcTotales } from '@/utils/iva';
import { useCartStore } from '@/store/cartStore';
import type { CartItem, CartTotals } from '@/features/cart/types';

/** Líneas del carrito (ref. estable: sólo re-renderiza al cambiar items). */
export const useCartItems = (): CartItem[] => useCartStore((s) => s.items);

/** Cantidad total de unidades (badge del navbar). Primitivo → selector seguro. */
export const useCartCount = (): number => useCartStore((s) => s.count());

/** Sucursal activa del carrito (null si está vacío). */
export const useCartSucursal = (): number | null => useCartStore((s) => s.sucursalId);

/**
 * Desglose neto/IVA/total. `totalEstimado()` crea un objeto nuevo cada vez, lo que
 * rompería la comparación de igualdad de Zustand si se usara como selector directo.
 * Lo derivamos con useMemo a partir de un primitivo estable (subtotalNeto).
 */
export const useCartTotal = (): CartTotals => {
    const items = useCartStore((s) => s.items);
    return useMemo(() => calcTotales(items), [items]);
};

/**
 * Acciones. Sus referencias son estables (se definen una vez en create), por eso
 * se seleccionan una a una: no creamos objetos dentro del selector de Zustand.
 */
export const useCartActions = () => {
    const addItem = useCartStore((s) => s.addItem);
    const setQty = useCartStore((s) => s.setQty);
    const removeItem = useCartStore((s) => s.removeItem);
    const clear = useCartStore((s) => s.clear);
    return { addItem, setQty, removeItem, clear };
};

/**
 * Acceso imperativo (fuera del render) para el checkoutService (T2.8).
 * Usa la instancia Singleton del store directamente.
 */
export const cartImperative = {
    toDetalles: () => useCartStore.getState().toDetalles(),
    getSucursalId: () => useCartStore.getState().sucursalId,
    clear: () => useCartStore.getState().clear(),
};