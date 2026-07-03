

import type { Pedido, PrioridadMedica } from '@/types/models';

/** Peso de orden por prioridad médica (menor = más urgente). */
const PESO_PRIORIDAD: Record<PrioridadMedica, number> = {
    CRITICA: 0,
    ALTA: 1,
    NORMAL: 2,
};

/**
 * Devuelve una copia ordenada (no muta el array original).
 * Empates de prioridad → EXPRESS antes que NORMAL → luego por fecha asc.
 */
export function ordenarColaLogistica(pedidos: Pedido[]): Pedido[] {
    return [...pedidos].sort(
        (a, b) =>
            PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad] ||
            Number(b.tipoDespacho === 'EXPRESS') -
                Number(a.tipoDespacho === 'EXPRESS') ||
            new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
    );
}
