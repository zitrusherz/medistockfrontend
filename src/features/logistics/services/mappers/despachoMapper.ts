

import type { EstadoEnvio, TipoDespacho } from '@/types/models';
import type {
    CotizacionResponse,
    Despacho,
    ServicioCotizado,
} from '../../types';

/* ── helpers de lectura defensiva (espejo de trackingMapper) ────────────────── */

/** Primer valor no vacío entre varias claves candidatas. */
function pick(obj: Record<string, unknown>, keys: string[]): unknown {
    for (const k of keys) {
        const v = obj[k];
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
}

/** Coacciona a string legible (acepta number); null si no aplica. */
function asString(v: unknown): string | null {
    if (typeof v === 'string') return v.trim() || null;
    if (typeof v === 'number') return String(v);
    return null;
}

/** Coacciona a number; 0 si no se puede (tolera "$2.990", "2990", etc.). */
function asNumber(v: unknown): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {

        const n = Number(v.replace(/[^\d-]/g, ''));
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}
const ESTADOS_VALIDOS: readonly EstadoEnvio[] = [
    'PENDIENTE',
    'RETIRADO',
    'EN_TRANSITO',
    'ENTREGADO',
    'DEVUELTO',
    'CANCELADO',
];

/** Reconoce un EstadoEnvio válido (case-insensitive); PENDIENTE si no calza. */
function asEstadoEnvio(v: unknown): EstadoEnvio {
    const s = typeof v === 'string' ? v.trim().toUpperCase() : '';
    return (ESTADOS_VALIDOS as readonly string[]).includes(s)
        ? (s as EstadoEnvio)
        : 'PENDIENTE';
}

/* ── toDespacho ─────────────────────────────────────────────────────────────── */

/**
 * Normaliza un Despacho desde:
 *   · la respuesta directa de PATCH .../estado/  (Despacho plano), o
 *   · la envoltura de POST /envios/  ({ despacho: {...}, numero_ot, ... }).
 * Si llega la envoltura, se desempaqueta `despacho` automáticamente.
 */
export function toDespacho(body: unknown): Despacho {
    const root = (body && typeof body === 'object' ? body : {}) as Record<
        string,
        unknown
    >;
    // Desempaqueta { despacho: {...} } si vino la envoltura de creación.
    const o = (root.despacho && typeof root.despacho === 'object'
        ? root.despacho
        : root) as Record<string, unknown>;

    return {
        id: asNumber(pick(o, ['id', 'despacho_id'])),
        pedido_id: asNumber(pick(o, ['pedido_id', 'pedidoId', 'order_id'])),
        courier_nombre:
            asString(pick(o, ['courier_nombre', 'courier', 'carrier'])) ?? '',
        numero_seguimiento:
            asString(
                pick(o, ['numero_seguimiento', 'tracking_number', 'numero_ot', 'ot']),
            ) ?? '',
        estado_envio: asEstadoEnvio(pick(o, ['estado_envio', 'estado', 'status'])),
        tipo_despacho:
            (asString(pick(o, ['tipo_despacho', 'tipo', 'service_type'])) ??
                'NORMAL') as TipoDespacho,
        fecha_despacho: asString(
            pick(o, ['fecha_despacho', 'fecha_creacion', 'created_at']),
        ),
        fecha_entrega_estimada: asString(
            pick(o, ['fecha_entrega_estimada', 'eta', 'estimated_delivery']),
        ),
        costo_despacho: asNumber(
            pick(o, ['costo_despacho', 'costo', 'valor', 'serviceValue']),
        ),
        url_etiqueta: asString(pick(o, ['url_etiqueta', 'label_url', 'etiqueta'])) ?? '',
    };
}

/* ── toCotizacion ───────────────────────────────────────────────────────────── */

/**
 * Normaliza la respuesta de cotización. `servicios_disponibles` es passthrough
 * de Chilexpress (ya en camelCase); aquí solo garantizamos que sea un array y
 * que la cabecera no llegue rota.
 */
export function toCotizacion(body: unknown): CotizacionResponse {
    const o = (body && typeof body === 'object' ? body : {}) as Record<
        string,
        unknown
    >;

    const servicios = Array.isArray(o.servicios_disponibles)
        ? (o.servicios_disponibles as ServicioCotizado[])
        : [];

    const pid = pick(o, ['pedido_id']);

    return {
        origin_county_code:
            asString(pick(o, ['origin_county_code', 'origen'])) ?? '',
        destination_county_code:
            asString(pick(o, ['destination_county_code', 'destino'])) ?? '',
        servicios_disponibles: servicios,
        pedido_id: pid == null ? null : asNumber(pid),
        num_cajas: asNumber(pick(o, ['num_cajas', 'cajas'])),
    };
}
