// src/features/logistics/services/logisticsService.ts
// Repository (patrón) — T3.4. Único punto del feature que orquesta la logística.
// Delega en la CourierStrategy elegida por entorno (real ↔ mock): este service
// solo expone métodos de dominio tipados; el "cómo habla cada courier" vive en la
// estrategia y la normalización en los mappers (Adapter).
//
// Los errores NO se re-envuelven: el interceptor de lib/axios ya rechaza con
// ApiError. Se dejan propagar a React Query (404 = sin despacho, 502 = courier
// caído los distingue useTracking por `status`).

import type {
    ActualizarEstadoDespachoRequest,
    CotizacionResponse,
    CotizarEnvioRequest,
    CrearEnvioRequest,
    Despacho,
} from '../types';
import type { EnvioTracking } from './mappers/trackingMapper';
import { getCourierStrategy } from './strategies';

// Estrategia fija por entorno (VITE_USE_MOCKS). No cambia en runtime.
const courier = getCourierStrategy();

export const logisticsService = {
    /** POST /api/logistics/cotizar/ — costo + servicios disponibles para el destino. */
    cotizar: (req: CotizarEnvioRequest): Promise<CotizacionResponse> =>
        courier.cotizar(req),

    /** POST /api/logistics/envios/ — crea el envío y su nº de seguimiento. */
    crearEnvio: (req: CrearEnvioRequest): Promise<Despacho> =>
        courier.crearEnvio(req),

    /** PATCH /api/logistics/envios/{pedido_id}/estado/ — avance manual del despacho. */
    actualizarEstado: (
        pedidoId: number | string,
        payload: ActualizarEstadoDespachoRequest,
    ): Promise<Despacho> => courier.actualizarEstado(pedidoId, payload),

    /**
     * GET /api/logistics/envios/{pedido_id}/tracking/?historial=true
     * Devuelve el tracking normalizado (cabecera + eventos). Conserva el nombre
     * `getTracking` y la firma que ya consume useTracking.ts (T2.11).
     */
    getTracking: (
        pedidoId: number | string,
        historial = true,
    ): Promise<EnvioTracking> => courier.tracking(pedidoId, historial),
};
