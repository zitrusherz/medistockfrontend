

import type { Lote } from '../types';

/** Lotes activos de `productoId`, ordenados FEFO (vencimiento ascendente). */
export function lotesFEFO(lotes: Lote[], productoId: number | string): Lote[] {
    const pid = String(productoId);
    return lotes
        .filter(
            (l) =>
                l.activo &&
                String(l.producto?.id ?? l.producto_id) === pid,
        )
        .sort(
            (a, b) =>
                new Date(a.fecha_vencimiento).getTime() -
                new Date(b.fecha_vencimiento).getTime(),
        );
}

/** Sugerencia FEFO: el primer lote por vencer del producto, o null si no hay. */
export function sugerirFEFO(
    lotes: Lote[],
    productoId: number | string,
): Lote | null {
    return lotesFEFO(lotes, productoId)[0] ?? null;
}
