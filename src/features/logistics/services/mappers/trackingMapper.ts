

import type { EstadoEnvio } from '@/types/models';
import type { TrackingEvento } from '../../types';

/** Evento de tracking ya normalizado para pintar en el timeline. */
export interface TrackingEventoNorm {
    /** Estado del courier (string libre o EstadoEnvio si calza). */
    estado: string | null;
    /** Texto descriptivo del evento. */
    descripcion: string;
    /** Fecha ISO del evento (o null). */
    fecha: string | null;
    /** Ubicación/sucursal del evento (o null). */
    ubicacion: string | null;
}

/** Tracking del envío normalizado: cabecera + eventos. */
export interface EnvioTracking {
    estadoEnvio: EstadoEnvio | null;
    numeroSeguimiento: string | null;
    courierNombre: string | null;
    eventos: TrackingEventoNorm[];
}

/* ── Helpers de lectura defensiva ───────────────────────────────────────────── */

const ESTADOS_VALIDOS: readonly EstadoEnvio[] = [
    'PENDIENTE',
    'RETIRADO',
    'EN_TRANSITO',
    'ENTREGADO',
    'DEVUELTO',
    'CANCELADO',
];

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

/** Reconoce un EstadoEnvio válido (case-insensitive); null si no calza. */
function asEstadoEnvio(v: unknown): EstadoEnvio | null {
    const s = typeof v === 'string' ? v.trim().toUpperCase() : '';
    return (ESTADOS_VALIDOS as readonly string[]).includes(s)
        ? (s as EstadoEnvio)
        : null;
}

function toEvento(raw: TrackingEvento): TrackingEventoNorm {
    const o = raw as Record<string, unknown>;
    return {
        estado: asString(pick(o, ['estado', 'status', 'state', 'estado_envio'])),
        descripcion:
            asString(
                pick(o, ['descripcion', 'description', 'detalle', 'detail', 'mensaje', 'message']),
            ) ?? '',
        fecha: asString(
            pick(o, ['fecha', 'date', 'timestamp', 'created_at', 'fecha_evento', 'fechaHora']),
        ),
        ubicacion: asString(pick(o, ['ubicacion', 'location', 'lugar', 'sucursal', 'oficina'])),
    };
}

/* ── Mapper principal ───────────────────────────────────────────────────────── */

/**
 * Normaliza el body del endpoint de tracking.
 * Tolera dos formas: `{ data: { tracking, estado_envio?, ... } }` o el objeto
 * `data` plano. Si `tracking` no es array, se trata como vacío.
 */
export function toEnvioTracking(body: unknown): EnvioTracking {
    const root = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const data = (root.data && typeof root.data === 'object' ? root.data : root) as Record<
        string,
        unknown
    >;

    const rawList = Array.isArray(data.tracking) ? (data.tracking as TrackingEvento[]) : [];
    const eventos = rawList.map(toEvento);

    // estado_envio: explícito en data > último evento reconocible > null.
    const estadoExplicito = asEstadoEnvio(pick(data, ['estado_envio', 'estado', 'status']));
    const estadoUltimoEvento = (() => {
        for (let i = eventos.length - 1; i >= 0; i--) {
            const evento = eventos[i];
            if (!evento) continue;
            const e = asEstadoEnvio(evento.estado);
            if (e) return e;
        }
        return null;
    })();

    return {
        estadoEnvio: estadoExplicito ?? estadoUltimoEvento,
        numeroSeguimiento: asString(
            pick(data, ['numero_seguimiento', 'tracking_number', 'numero_ot', 'ot']),
        ),
        courierNombre: asString(pick(data, ['courier_nombre', 'courier', 'carrier'])),
        eventos,
    };
}
