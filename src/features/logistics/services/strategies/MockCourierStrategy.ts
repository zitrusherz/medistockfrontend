// src/features/logistics/services/strategies/MockCourierStrategy.ts
// Strategy concreto: courier FALSO. VITE_USE_MOCKS=true → demo/diseño sin sandbox.
// Construye respuestas con el MISMO shape crudo del backend y las pasa por los
// mismos mappers (toCotizacion / toDespacho / toEnvioTracking), así el mock
// ejercita el Adapter exactamente igual que el courier real.

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

const nowISO = () => new Date().toISOString();
const masDias = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const trackingNumber = (pedidoId: number | string) =>
    `MOCK-${String(pedidoId).padStart(6, '0')}`;

export const mockCourierStrategy: CourierStrategy = {
    cotizar: async (req: CotizarEnvioRequest): Promise<CotizacionResponse> =>
        toCotizacion({
            origin_county_code: 'STGO',
            destination_county_code: req.county_code_destino,
            servicios_disponibles: [
                {
                    serviceTypeCode: 1,
                    serviceDescription: 'Express Mock',
                    finalWeight: '1.0',
                    serviceValue: '4990',
                    deliveryType: 1,
                },
                {
                    serviceTypeCode: 3,
                    serviceDescription: 'Normal Mock',
                    finalWeight: '1.0',
                    serviceValue: '2990',
                    deliveryType: 2,
                },
            ],
            pedido_id: req.pedido_id ?? null,
            num_cajas: 1,
        }),

    crearEnvio: async (req: CrearEnvioRequest): Promise<Despacho> =>
        toDespacho({
            despacho: {
                id: Math.floor(Math.random() * 100000),
                pedido_id: req.pedido_id,
                courier_nombre: 'Courier Mock',
                numero_seguimiento: trackingNumber(req.pedido_id),
                estado_envio: 'PENDIENTE',
                tipo_despacho: 'NORMAL',
                fecha_despacho: nowISO(),
                fecha_entrega_estimada: masDias(3),
                costo_despacho: 2990,
                url_etiqueta: 'https://example.test/etiqueta-mock.pdf',
            },
            numero_ot: trackingNumber(req.pedido_id),
            num_cajas: 1,
            etiqueta_disponible: true,
            service_description: 'Normal Mock',
        }),

    actualizarEstado: async (
        pedidoId: number | string,
        payload: ActualizarEstadoDespachoRequest,
    ): Promise<Despacho> =>
        toDespacho({
            id: Math.floor(Math.random() * 100000),
            pedido_id: pedidoId,
            courier_nombre: 'Courier Mock',
            numero_seguimiento: trackingNumber(pedidoId),
            estado_envio: payload.nuevo_estado,
            tipo_despacho: 'NORMAL',
            fecha_despacho: nowISO(),
            fecha_entrega_estimada: masDias(2),
            costo_despacho: 2990,
            url_etiqueta: 'https://example.test/etiqueta-mock.pdf',
        }),

    tracking: async (
        pedidoId: number | string,
        _historial = true,
    ): Promise<EnvioTracking> =>
        toEnvioTracking({
            data: {
                estado_envio: 'EN_TRANSITO',
                numero_seguimiento: trackingNumber(pedidoId),
                courier_nombre: 'Courier Mock',
                tracking: [
                    {
                        estado: 'RETIRADO',
                        descripcion: 'Paquete retirado desde bodega de origen.',
                        fecha: masDias(-2),
                        ubicacion: 'CD Santiago',
                    },
                    {
                        estado: 'EN_TRANSITO',
                        descripcion: 'En ruta hacia el destino.',
                        fecha: masDias(-1),
                        ubicacion: 'Centro de distribución',
                    },
                ],
            },
        }),
};
