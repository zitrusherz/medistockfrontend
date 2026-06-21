// features/admin/selectors/adminStats.ts
// T4.1 — Cálculo PURO de estadísticas del admin (sin React, sin red).
// Recibe lo que useTodosPedidos() + usePagos() + useClientes() ya cachearon
// (React Query deduplica entre vistas), así no dispara fetches extra. Puro =
// testeable. Réplica de lo que hacía `Admin.kpis()` en la maqueta, pero sobre
// datos reales. (Patrón: Adapter / selector.)
//
// Convenciones:
//  · "Ventas" = dinero realmente ingresado = pagos en estado CONFIRMADO,
//    monto = montoConfirmado, fecha = fechaConfirmacion (fallback fechaCreacion).
//  · Montos en CLP entero (M1). El formateo lo hace la UI, NO este módulo.

import type { Cliente } from '@/features/accounts/types/cliente';
import type { Pago, Pedido, TipoVenta } from '@/types/models';

const MESES_VENTANA = 12;

export const LABEL_TIPO_VENTA: Record<TipoVenta, string> = {
    WEBPAY: 'Webpay (B2C)',
    TRANSFERENCIA: 'Transferencia',
    MAYORISTA: 'Mayorista',
    CREDITO_INSTITUCIONAL: 'Crédito inst. (B2B)',
};

/** Fecha con la que imputamos una venta: confirmación, o creación si falta. */
const fechaVenta = (p: Pago): string => p.fechaConfirmacion ?? p.fechaCreacion;

const esConfirmado = (p: Pago): boolean => p.estadoPago === 'CONFIRMADO';

/** 'YYYY-MM' a partir de una fecha. */
const mesKey = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Etiqueta corta es-CL: "jun 26". */
const mesLabel = (d: Date): string => {
    const mes = new Intl.DateTimeFormat('es-CL', { month: 'short' })
        .format(d)
        .replace('.', '');
    return `${mes} ${String(d.getFullYear()).slice(2)}`;
};

export interface PuntoMensual {
    /** Clave estable 'YYYY-MM' (ordenable, sirve para el CSV). */
    key: string;
    /** Etiqueta corta para el eje X ("jun 26"). */
    label: string;
    /** Ventas confirmadas del mes (CLP entero). */
    total: number;
}

export interface RebanadaCategoria {
    label: string;
    value: number;
}

export interface FilaTopComprador {
    clienteId: number;
    cliente: string;
    total: number;
    pedidos: number;
}

export interface OpcionesStats {
    /** epoch ms; inyectable para test (default Date.now()). */
    ahora?: number;
    /** Cuántos meses hacia atrás (default 12). */
    meses?: number;
}

/**
 * Serie de ventas confirmadas de los últimos N meses (orden cronológico).
 * Devuelve TODOS los meses de la ventana, incluso los de total 0, para que el
 * gráfico de barras no tenga huecos.
 */
export function ventasMensuales(
    pagos: Pago[],
    opts: OpcionesStats = {},
): PuntoMensual[] {
    const ahora = new Date(opts.ahora ?? Date.now());
    const meses = opts.meses ?? MESES_VENTANA;

    // Buckets vacíos, del más antiguo al más nuevo.
    const buckets = new Map<string, PuntoMensual>();
    for (let i = meses - 1; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        buckets.set(mesKey(d), { key: mesKey(d), label: mesLabel(d), total: 0 });
    }

    for (const p of pagos) {
        if (!esConfirmado(p)) continue;
        const d = new Date(fechaVenta(p));
        if (Number.isNaN(d.getTime())) continue;
        const b = buckets.get(mesKey(d));
        if (b) b.total += p.montoConfirmado;
    }

    return [...buckets.values()];
}

/** Total de ventas confirmadas dentro de la ventana (suma de la serie). */
export const ventasUltimos12m = (
    pagos: Pago[],
    opts: OpcionesStats = {},
): number => ventasMensuales(pagos, opts).reduce((s, m) => s + m.total, 0);

/** Nº de pagos confirmados dentro de la ventana. */
export function pagosConfirmados12m(
    pagos: Pago[],
    opts: OpcionesStats = {},
): number {
    const ahora = new Date(opts.ahora ?? Date.now());
    const meses = opts.meses ?? MESES_VENTANA;
    const desde = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);
    return pagos.filter((p) => {
        if (!esConfirmado(p)) return false;
        const d = new Date(fechaVenta(p));
        return !Number.isNaN(d.getTime()) && d >= desde;
    }).length;
}

/** Ticket promedio = ventas12m / nº pagos confirmados 12m (0 si no hay). */
export function ticketPromedio(pagos: Pago[], opts: OpcionesStats = {}): number {
    const n = pagosConfirmados12m(pagos, opts);
    if (n === 0) return 0;
    return Math.round(ventasUltimos12m(pagos, opts) / n);
}

/**
 * Crecimiento % del último mes vs el anterior (sobre ventas confirmadas).
 * null si no hay mes previo con ventas (evita división por cero / ±Infinity).
 */
export function crecimientoMensual(
    pagos: Pago[],
    opts: OpcionesStats = {},
): number | null {
    const serie = ventasMensuales(pagos, opts);
    if (serie.length < 2) return null;

    const actualItem = serie[serie.length - 1];
    const previoItem = serie[serie.length - 2];

    // Narrows the type, removing 'undefined'
    if (!actualItem || !previoItem) return null;

    const actual = actualItem.total;
    const previo = previoItem.total;

    if (previo === 0) return null;
    return Math.round(((actual - previo) / previo) * 1000) / 10; // 1 decimal
}

/**
 * Ventas confirmadas desglosadas por TIPO DE VENTA (B2C/B2B/…).
 * Desglose por defecto del donut MIENTRAS el backend no exponga la agregación
 * por categoría real (los DetallePedido no traen categoría). Cruza pago→pedido
 * por pedidoId para conocer el tipo de venta.
 */
export function ventasPorTipoVenta(
    pagos: Pago[],
    pedidos: Pedido[],
): RebanadaCategoria[] {
    const tipoPorPedido = new Map<number, TipoVenta>();
    for (const ped of pedidos) tipoPorPedido.set(ped.id, ped.tipoVenta);

    const acc = new Map<TipoVenta, number>();
    for (const p of pagos) {
        if (!esConfirmado(p)) continue;
        const tipo = tipoPorPedido.get(p.pedidoId);
        if (!tipo) continue;
        acc.set(tipo, (acc.get(tipo) ?? 0) + p.montoConfirmado);
    }

    return [...acc.entries()]
        .map(([tipo, value]) => ({ label: LABEL_TIPO_VENTA[tipo] ?? tipo, value }))
        .sort((a, b) => b.value - a.value);
}

/** Ranking de compradores por monto total pedido (bruto), top N. */
export function topCompradores(pedidos: Pedido[], n = 8): FilaTopComprador[] {
    const acc = new Map<number, FilaTopComprador>();
    for (const ped of pedidos) {
        const prev = acc.get(ped.clienteId);
        if (prev) {
            prev.total += ped.total;
            prev.pedidos += 1;
        } else {
            acc.set(ped.clienteId, {
                clienteId: ped.clienteId,
                cliente: ped.cliente || `Cliente #${ped.clienteId}`,
                total: ped.total,
                pedidos: 1,
            });
        }
    }
    return [...acc.values()].sort((a, b) => b.total - a.total).slice(0, n);
}

/** Últimos N pedidos por fecha de creación (más nuevo primero). */
export const pedidosRecientes = (pedidos: Pedido[], n = 8): Pedido[] =>
    [...pedidos]
        .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
        .slice(0, n);

export interface AdminKpis {
    ventas12m: number;
    pedidosTotales: number;
    ticketPromedio: number;
    clientesActivos: number;
    /** % vs mes anterior; null si no calculable. */
    crecimiento: number | null;
}

/** KPIs analíticos de la página Estadísticas. */
export function adminKpis(
    pedidos: Pedido[],
    pagos: Pago[],
    clientes: Cliente[],
    opts: OpcionesStats = {},
): AdminKpis {
    return {
        ventas12m: ventasUltimos12m(pagos, opts),
        pedidosTotales: pedidos.length,
        ticketPromedio: ticketPromedio(pagos, opts),
        clientesActivos: clientes.filter((c) => c.activo).length,
        crecimiento: crecimientoMensual(pagos, opts),
    };
}
