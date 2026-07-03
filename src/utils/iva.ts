

import type { CartItem } from '@/features/cart/types';

export const calcularDiferencia = (monto: number, montoConIVA: number): number => {
    const montoIVA = montoConIVA - monto;
    return montoIVA;
};

export const calcularIVA = (monto: number): number => {
    const IVA = 0.19;
    const montoIVA = monto * IVA;
    return montoIVA;
};

export const calcTotales = (items: CartItem[]) => {
    const neto = items.reduce((s, i) => s + i.priceNeto * i.quantity, 0);
    const total = items.reduce((s, i) => s + i.priceIva * i.quantity, 0);
    return { neto, iva: total - neto, total };
};

/**
 * Desglosa un monto NETO (CLP entero) en { neto, iva, total }.
 * Para previsualizar un solo precio (no carrito): IVA 19% redondeado a entero,
 * para no mostrar decimales en CLP (M1/M2).
 */
export const desgloseIVA = (
    neto: number,
): { neto: number; iva: number; total: number } => {
    const iva = Math.round(neto * 0.19);
    return { neto, iva, total: neto + iva };
};
