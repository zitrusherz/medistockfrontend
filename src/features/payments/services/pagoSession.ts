// src/features/payments/services/pagoSession.ts
// T2.9 — Persistencia EFÍMERA del pago en curso.
//
// Guarda el token_ws (y pedidoId) en sessionStorage antes de redirigir a Webpay,
// para recuperar el flujo si la pestaña de retorno pierde el query param o el
// usuario recarga. Es efímero: vive sólo la sesión de pestaña, no contamina el
// localStorage permanente (donde viven los tokens de auth).

const KEY = 'medistock-pago-pendiente';

export interface PagoPendiente {
    token: string;
    pedidoId: number;
    transaccionId: number;
}

export const guardarPagoPendiente = (p: PagoPendiente): void => {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(p));
    } catch {
        /* sessionStorage no disponible (modo privado, etc.): seguimos sin persistir. */
    }
};

export const leerPagoPendiente = (): PagoPendiente | null => {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as PagoPendiente) : null;
    } catch {
        return null;
    }
};

export const limpiarPagoPendiente = (): void => {
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        /* noop */
    }
};
