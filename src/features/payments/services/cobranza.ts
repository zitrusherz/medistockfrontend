// features/payments/services/cobranza.ts
// T3.7 — Cuentas por cobrar: cruce PURO pagos ↔ pedidos (sin React, sin red).
//
// Definición honesta: "por cobrar" = pedido EXIGIBLE (ya aprobado y en curso)
// SIN pago en estado CONFIRMADO. NO afirmamos "moroso" en sentido estricto:
// el modelo Pedido no expone plazo ni fecha de vencimiento de pago, así que no
// podemos saber si la deuda está VENCIDA. Usamos los días desde la creación como
// PROXY y, con un umbral de crédito, marcamos cada línea como vencida/vigente.
//   → Si el backend agrega fecha de vencimiento real, reemplazar
//     `diasMora > diasCredito` por `fechaVencimiento < ahora`.
//
// Recibe lo que usePagos() + useTodosPedidos() ya cachearon (React Query
// deduplica entre vistas), por eso no dispara fetches extra. Puro = testeable.

import type {
    Pago,
    Pedido,
    EstadoPago,
    EstadoPedido,
    TipoVenta,
} from '@/types/models';

/**
 * Estados de pedido que generan deuda exigible. Se excluyen:
 *   PENDIENTE  → aún no aprobado. Además, en Webpay B2C el pago ocurre durante
 *                la transición PENDIENTE→aprobado, así que un PENDIENTE es
 *                "aún no pagó / en proceso o abandonado", NO "debe". Incluirlo
 *                llenaría la cobranza de falsos positivos (carros abandonados).
 *                Los fallidos B2C se ven por estado_pago en la pantalla Pagos.
 *   RECHAZADO / CANCELADO → pedido muerto, no se cobra.
 */
const ESTADOS_EXIGIBLES: EstadoPedido[] = [
    'APROBADO',
    'EN_PICKING',
    'DESPACHADO',
    'ENTREGADO',
];

const DIA_MS = 86_400_000;

/** Umbral por defecto (proxy de "crédito a 30 días"). Ajustable por parámetro. */
export const DIAS_CREDITO_DEFAULT = 30;

export interface LineaPorCobrar {
    pedidoId: number;
    estadoPedido: EstadoPedido;
    tipoVenta: TipoVenta;
    total: number;
    fechaCreacion: string;
    /** Días transcurridos desde la creación (proxy de antigüedad de la deuda). */
    diasMora: number;
    /** diasMora > diasCredito. Proxy de "vencido" mientras no haya fecha real. */
    vencido: boolean;
    /** Último estado de pago del pedido; null = nunca se intentó pagar. */
    ultimoEstadoPago: EstadoPago | null;
}

export interface CuentaPorCobrar {
    clienteId: number;
    cliente: string;
    rut: string | null;
    email: string | null;
    pedidos: LineaPorCobrar[];
    cantidadPedidos: number;
    /** Suma de todos los totales por cobrar (CLP entero). */
    totalPorCobrar: number;
    /** Suma de los totales SOLO de pedidos vencidos (CLP entero). */
    totalVencido: number;
    tieneVencidos: boolean;
    diasMoraMax: number;
}

export interface OpcionesCobranza {
    /** epoch ms; inyectable para test (default Date.now()). */
    ahora?: number;
    /** Umbral de días para marcar vencido (default DIAS_CREDITO_DEFAULT). */
    diasCredito?: number;
}

/** Último pago (por fecha de creación) registrado para cada pedidoId. */
function ultimoPagoPorPedido(pagos: Pago[]): Map<number, Pago> {
    const m = new Map<number, Pago>();
    for (const p of pagos) {
        const prev = m.get(p.pedidoId);
        // fechaCreacion es ISO: comparar como string ordena igual que cronológico.
        if (!prev || p.fechaCreacion > prev.fechaCreacion) m.set(p.pedidoId, p);
    }
    return m;
}

/** rut/email del cliente tomados de los pagos enriquecidos (GET /payments/todos/). */
function datosClientePorId(
    pagos: Pago[],
): Map<number, { rut: string | null; email: string | null }> {
    const m = new Map<number, { rut: string | null; email: string | null }>();
    for (const p of pagos) {
        if (p.clienteId != null && !m.has(p.clienteId)) {
            m.set(p.clienteId, {
                rut: p.clienteRut ?? null,
                email: p.clienteEmail ?? null,
            });
        }
    }
    return m;
}

/**
 * Cuentas por cobrar: clientes con ≥1 pedido exigible sin pago CONFIRMADO.
 * Agrupa por cliente y ordena por monto por cobrar descendente.
 */
export function calcularCobranza(
    pagos: Pago[],
    pedidos: Pedido[],
    opts: OpcionesCobranza = {},
): CuentaPorCobrar[] {
    const ahora = opts.ahora ?? Date.now();
    const diasCredito = opts.diasCredito ?? DIAS_CREDITO_DEFAULT;

    const pagados = new Set(
        pagos.filter((p) => p.estadoPago === 'CONFIRMADO').map((p) => p.pedidoId),
    );
    const ultimoPago = ultimoPagoPorPedido(pagos);
    const datosCliente = datosClientePorId(pagos);

    const porCliente = new Map<number, CuentaPorCobrar>();

    for (const pedido of pedidos) {
        if (!ESTADOS_EXIGIBLES.includes(pedido.estado)) continue;
        if (pagados.has(pedido.id)) continue; // tiene pago confirmado → al día

        const diasMora = Math.max(
            0,
            Math.floor((ahora - new Date(pedido.fechaCreacion).getTime()) / DIA_MS),
        );
        const vencido = diasMora > diasCredito;

        const linea: LineaPorCobrar = {
            pedidoId: pedido.id,
            estadoPedido: pedido.estado,
            tipoVenta: pedido.tipoVenta,
            total: pedido.total,
            fechaCreacion: pedido.fechaCreacion,
            diasMora,
            vencido,
            ultimoEstadoPago: ultimoPago.get(pedido.id)?.estadoPago ?? null,
        };

        const acc = porCliente.get(pedido.clienteId);
        if (acc) {
            acc.pedidos.push(linea);
            acc.cantidadPedidos += 1;
            acc.totalPorCobrar += pedido.total;
            acc.totalVencido += vencido ? pedido.total : 0;
            acc.tieneVencidos = acc.tieneVencidos || vencido;
            acc.diasMoraMax = Math.max(acc.diasMoraMax, diasMora);
        } else {
            const extra = datosCliente.get(pedido.clienteId);
            porCliente.set(pedido.clienteId, {
                clienteId: pedido.clienteId,
                cliente: pedido.cliente,
                rut: extra?.rut ?? null,
                email: extra?.email ?? null,
                pedidos: [linea],
                cantidadPedidos: 1,
                totalPorCobrar: pedido.total,
                totalVencido: vencido ? pedido.total : 0,
                tieneVencidos: vencido,
                diasMoraMax: diasMora,
            });
        }
    }

    return [...porCliente.values()].sort((a, b) => b.totalPorCobrar - a.totalPorCobrar);
}

/** Total global por cobrar (suma de todas las cuentas). */
export const totalPorCobrarGlobal = (cuentas: CuentaPorCobrar[]): number =>
    cuentas.reduce((s, c) => s + c.totalPorCobrar, 0);

/** Total global vencido (suma de los montos vencidos). */
export const totalVencidoGlobal = (cuentas: CuentaPorCobrar[]): number =>
    cuentas.reduce((s, c) => s + c.totalVencido, 0);

/** Cantidad total de pedidos por cobrar (suma sobre clientes). */
export const totalPedidosPorCobrar = (cuentas: CuentaPorCobrar[]): number =>
    cuentas.reduce((s, c) => s + c.cantidadPedidos, 0);
