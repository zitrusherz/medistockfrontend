// features/admin/types/index.ts
// T4.1 — Contratos de los agregados que el BACKEND expondrá para el dashboard.
// Mientras no existan, los hooks que los consumen quedan deshabilitados por
// bandera (ver hooks/useCotizaciones.ts y hooks/useVentasPorCategoria.ts) y la
// UI cae a un cálculo client-side / estado "pendiente backend".
//
// Ver CONTRATO_BACKEND_STATS.md para la forma exacta del JSON esperado.

// ---------------------------------------------------------------------------
// Ventas por categoría (donut de Estadísticas)
// ---------------------------------------------------------------------------

/** Forma cruda esperada de GET /payments/stats/ventas-por-categoria/. */
export interface VentaCategoriaDTO {
    categoria_id: number;
    categoria: string;
    /** Ventas confirmadas atribuibles a la categoría (CLP entero, con IVA). */
    total: number;
    /** Opcionales (si el backend los entrega; la UI los ignora si faltan). */
    pedidos?: number;
    unidades?: number;
}

/** Modelo de dominio (camelCase) que consume la UI. */
export interface VentaCategoria {
    categoriaId: number;
    categoria: string;
    total: number;
    pedidos: number | null;
    unidades: number | null;
}

export const toVentaCategoria = (dto: VentaCategoriaDTO): VentaCategoria => ({
    categoriaId: dto.categoria_id,
    categoria: dto.categoria,
    total: dto.total,
    pedidos: dto.pedidos ?? null,
    unidades: dto.unidades ?? null,
});

// ---------------------------------------------------------------------------
// Cotizaciones (KPI genérico — backend lo creará después)
// ---------------------------------------------------------------------------

/**
 * Resumen de cotizaciones para el KPI de Inicio. Genérico a propósito: el
 * backend solo necesita devolver, como mínimo, cuántas hay pendientes.
 */
export interface CotizacionesResumenDTO {
    pendientes: number;
    /** Opcionales para enriquecer el KPI más adelante. */
    total?: number;
    monto_pendiente?: number;
}

export interface CotizacionesResumen {
    pendientes: number;
    total: number | null;
    montoPendiente: number | null;
}

export const toCotizacionesResumen = (
    dto: CotizacionesResumenDTO,
): CotizacionesResumen => ({
    pendientes: dto.pendientes,
    total: dto.total ?? null,
    montoPendiente: dto.monto_pendiente ?? null,
});
