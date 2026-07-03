

import api from '@/lib/axios';
import type {
    ActualizarEstadoDespachoRequest,
    CotizacionResponse,
    CotizarEnvioRequest,
    CrearEnvioRequest,
    Despacho,
} from '../../types';
import { toCotizacion, toDespacho } from '../mappers/despachoMapper';
import { toEnvioTracking, type EnvioTracking } from '../mappers/trackingMapper';
import type { CourierStrategy } from './CourierStrategy';

export const chilexpressStrategy: CourierStrategy = {
    cotizar: async (req: CotizarEnvioRequest): Promise<CotizacionResponse> => {
        const { data } = await api.post('/logistics/cotizar/', req);
        return toCotizacion(data);
    },

    crearEnvio: async (req: CrearEnvioRequest): Promise<Despacho> => {
        // 201 → { despacho: {...}, numero_ot, ... }. toDespacho desempaqueta `despacho`.
        const { data } = await api.post('/logistics/envios/', req);
        return toDespacho(data);
    },

    actualizarEstado: async (
        pedidoId: number | string,
        payload: ActualizarEstadoDespachoRequest,
    ): Promise<Despacho> => {
        const { data } = await api.patch(
            `/logistics/envios/${pedidoId}/estado/`,
            payload,
        );
        return toDespacho(data);
    },

    tracking: async (
        pedidoId: number | string,
        historial = true,
    ): Promise<EnvioTracking> => {
        const { data } = await api.get(`/logistics/envios/${pedidoId}/tracking/`, {
            params: { historial },
        });
        return toEnvioTracking(data);
    },
};
