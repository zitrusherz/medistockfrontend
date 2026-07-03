

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
