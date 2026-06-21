// src/features/logistics/services/colaPrioridad.ts
// T3.5 — Lógica de negocio 1: cola priorizada del Operador Logístico.
// Orden canónico: prioridad médica (CRÍTICA→ALTA→NORMAL) → EXPRESS arriba →
// más antiguo primero (FIFO por fecha de creación).
//
// Pura y sin dependencias de React: se puede testear en aislamiento y reusar en
// cualquier vista (Órdenes, dashboard, alertas).

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
