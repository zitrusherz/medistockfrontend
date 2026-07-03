

import { useMemo } from 'react';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import type { EstadoPedido } from '@/features/orders/types';

export interface CompradorRanking {
    clienteId: number;
    nombre: string;
    pedidos: number;
    total: number;
}

/** Estados que NO cuentan como compra real. */
const NO_CUENTAN: EstadoPedido[] = ['RECHAZADO', 'CANCELADO'];

export function useTopCompradores() {
    const { pedidos, isLoading, isError } = useTodosPedidos();

    const ranking = useMemo<CompradorRanking[]>(() => {
        const map = new Map<number, CompradorRanking>();

        for (const p of pedidos) {
            if (NO_CUENTAN.includes(p.estado)) continue;

            const acc =
                map.get(p.clienteId) ??
                { clienteId: p.clienteId, nombre: p.cliente, pedidos: 0, total: 0 };

            acc.pedidos += 1;
            acc.total += p.total;
            if (p.cliente) acc.nombre = p.cliente; // último nombre visto, no vacío

            map.set(p.clienteId, acc);
        }

        return [...map.values()].sort((a, b) => b.total - a.total);
    }, [pedidos]);

    return {
        ranking,
        isLoading,
        isEmpty: !isLoading && ranking.length === 0,
        isError,
    };
}
