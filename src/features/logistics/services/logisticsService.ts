

import api from '@/lib/axios';
import type {
    ActualizarEstadoDespachoRequest,
    CotizacionResponse,
    CotizarEnvioRequest,
    CotizarProductosRequest,
    CrearEnvioRequest,
    Despacho,
} from '../types';
import type { EnvioTracking } from './mappers/trackingMapper';
import { toCotizacion } from './mappers/despachoMapper';
import { getCourierStrategy } from './strategies';

// Estrategia fija por entorno (VITE_USE_MOCKS). No cambia en runtime.
const courier = getCourierStrategy();

export const logisticsService = {
    /** POST /api/logistics/cotizar/ — costo + servicios disponibles para el destino. */
    cotizar: (req: CotizarEnvioRequest): Promise<CotizacionResponse> =>
        courier.cotizar(req),


    cotizarProductos: async (
        req: CotizarProductosRequest,
    ): Promise<CotizacionResponse> => {
        const { data } = await api.post('/logistics/cotizar/', req);
        return toCotizacion(data);
    },

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
