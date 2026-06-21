// src/features/payments/services/paymentState.ts
// T2.9 — STATE (patrón). El `estado_pago` de la transacción decide qué se ve.
//
// Máquina de estados del pago:
//   INICIADO ──► CONFIRMADO   (aprobado)
//            ├─► RECHAZADO    (banco rechaza)
//            ├─► ANULADO      (usuario anula en Webpay)
//            └─► ERROR        (falla técnica / no se pudo confirmar)
//
// Aislamos aquí el mapeo estado→presentación para que las páginas de pago no
// repitan condicionales y para documentar el patrón State del flujo (rúbrica IL3.3).

import type { CommitResult } from './strategies/PaymentStrategy';

/** Resultado visual derivado del estado de la transacción. */
export type ResultadoPago = 'aprobado' | 'rechazado' | 'anulado' | 'error' | 'pendiente';

export interface ResultadoConfig {
    titulo: string;
    mensaje: string;
    /** Familia de color semántica del sistema de diseño. */
    tone: 'success' | 'danger' | 'warning' | 'info';
}

/**
 * estado_pago (string del backend) → resultado visual.
 *
 * Tipado laxo a `string` a propósito: no acoplamos esta tabla a la unión exacta
 * de `EstadoPago`. Si el backend agrega un estado nuevo, cae a 'pendiente' en
 * vez de romper el build.
 */
const POR_ESTADO: Record<string, ResultadoPago> = {
    CONFIRMADO: 'aprobado',
    RECHAZADO: 'rechazado',
    ANULADO: 'anulado',
    ERROR: 'error',
    INICIADO: 'pendiente',
};

export const resultadoDesdeEstado = (estadoPago: string): ResultadoPago =>
    POR_ESTADO[estadoPago] ?? 'pendiente';

/**
 * Deriva el resultado de un `commit`. `aprobada` manda (es lo que afirma Webpay);
 * si es `false`, el `estado_pago` precisa el motivo (rechazado / anulado / error).
 */
export const resultadoDesdeCommit = (commit: CommitResult): ResultadoPago =>
    commit.aprobada ? 'aprobado' : resultadoDesdeEstado(commit.estadoPago);

/** Copy de cada resultado (voz activa, dice qué pasó y qué hacer). */
export const RESULTADO_CONFIG: Record<ResultadoPago, ResultadoConfig> = {
    aprobado: {
        titulo: 'Pago aprobado',
        mensaje: 'Tu pago se procesó correctamente y tu pedido entró en preparación.',
        tone: 'success',
    },
    rechazado: {
        titulo: 'Pago rechazado',
        mensaje:
            'El banco rechazó la transacción y no se realizó ningún cobro. Puedes reintentar con otra tarjeta.',
        tone: 'danger',
    },
    anulado: {
        titulo: 'Pago anulado',
        mensaje:
            'Anulaste el pago en Webpay. Tu pedido sigue pendiente; puedes reintentar cuando quieras.',
        tone: 'warning',
    },
    error: {
        titulo: 'No pudimos confirmar el pago',
        mensaje:
            'Ocurrió un error al procesar la transacción. Si el cobro se realizó, se reflejará al consultar el estado.',
        tone: 'danger',
    },
    pendiente: {
        titulo: 'Pago en proceso',
        mensaje: 'Aún estamos confirmando tu pago. Consulta el estado en unos segundos.',
        tone: 'info',
    },
};

/** `true` cuando el resultado permite reintentar el pago del mismo pedido. */
export const permiteReintento = (r: ResultadoPago): boolean =>
    r === 'rechazado' || r === 'anulado' || r === 'error';
