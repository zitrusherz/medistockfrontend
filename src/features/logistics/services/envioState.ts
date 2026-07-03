

import type { EstadoEnvio } from '@/types/models';

/** Pasos lineales de la barra de progreso (orden canónico). */
export const PASOS_ENVIO = [
    'PENDIENTE',
    'RETIRADO',
    'EN_TRANSITO',
    'ENTREGADO',
] as const;

export type PasoEnvio = (typeof PASOS_ENVIO)[number];

/** Familia de color semántica del sistema de diseño. */
export type ToneEnvio = 'info' | 'warning' | 'success' | 'danger';

export interface EstadoEnvioConfig {
    label: string;
    descripcion: string;
    tone: ToneEnvio;
}

/** estado_envio → presentación (label legible, copy, color). */
export const ESTADO_ENVIO_CONFIG: Record<EstadoEnvio, EstadoEnvioConfig> = {
    PENDIENTE: {
        label: 'Pendiente de retiro',
        descripcion: 'El despacho fue generado y espera que el courier retire el paquete.',
        tone: 'info',
    },
    RETIRADO: {
        label: 'Retirado',
        descripcion: 'El courier ya tiene el paquete en su poder.',
        tone: 'info',
    },
    EN_TRANSITO: {
        label: 'En tránsito',
        descripcion: 'Tu pedido va en camino al destino.',
        tone: 'warning',
    },
    ENTREGADO: {
        label: 'Entregado',
        descripcion: 'El pedido fue entregado en destino.',
        tone: 'success',
    },
    DEVUELTO: {
        label: 'Devuelto',
        descripcion: 'El envío fue devuelto al origen.',
        tone: 'danger',
    },
    CANCELADO: {
        label: 'Cancelado',
        descripcion: 'El envío fue cancelado.',
        tone: 'danger',
    },
};

/**
 * Tipado laxo a propósito: si el backend agrega un estado nuevo, cae a PENDIENTE
 * en vez de romper el render.
 */
export const estadoEnvioConfig = (estado: EstadoEnvio): EstadoEnvioConfig =>
    ESTADO_ENVIO_CONFIG[estado] ?? ESTADO_ENVIO_CONFIG.PENDIENTE;

/** Índice del estado dentro de PASOS_ENVIO. -1 si es rama de excepción. */
export const indicePaso = (estado: EstadoEnvio): number =>
    (PASOS_ENVIO as readonly string[]).indexOf(estado);

/** DEVUELTO/CANCELADO no entran en la barra lineal. */
export const esRamaExcepcion = (estado: EstadoEnvio): boolean =>
    estado === 'DEVUELTO' || estado === 'CANCELADO';

/** Estados terminales (no se siguen moviendo). */
export const esTerminal = (estado: EstadoEnvio): boolean =>
    estado === 'ENTREGADO' || estado === 'DEVUELTO' || estado === 'CANCELADO';

/**
 * Gatillo del polling suave. Solo refrescamos mientras va en camino.
 * (Spec T2.11: refetch cada ~30s mientras estado_envio === 'EN_TRANSITO'.)
 */
export const esEnTransito = (estado: EstadoEnvio | null | undefined): boolean =>
    estado === 'EN_TRANSITO';
