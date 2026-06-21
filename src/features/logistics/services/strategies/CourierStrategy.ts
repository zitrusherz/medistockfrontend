// src/features/logistics/services/strategies/CourierStrategy.ts
// Strategy (patrón) — T3.4. Contrato del courier. Chilexpress real y Mock lo
// cumplen IGUAL. El resto de la app (logisticsService, hooks, Timeline) habla
// solo con esta interfaz: cambiar de courier = cambiar la implementación, no la
// feature. Espejo de PaymentStrategy.ts.

import type {
    ActualizarEstadoDespachoRequest,
    CotizacionResponse,
    CotizarEnvioRequest,
    CrearEnvioRequest,
    Despacho,
} from '../../types';
import type { EnvioTracking } from '../mappers/trackingMapper';

export interface CourierStrategy {
    /** Cotiza costo + servicios disponibles para un destino. */
    cotizar(req: CotizarEnvioRequest): Promise<CotizacionResponse>;

    /**
     * Crea el envío. Genera el nº de seguimiento que alimenta el Timeline (T2.11).
     * Devuelve un Despacho ya normalizado (la envoltura `CrearEnvioResponse` se
     * desempaqueta en el Adapter).
     */
    crearEnvio(req: CrearEnvioRequest): Promise<Despacho>;

    /** Avance manual del estado del despacho (RETIRADO/EN_TRANSITO/ENTREGADO/…). */
    actualizarEstado(
        pedidoId: number | string,
        payload: ActualizarEstadoDespachoRequest,
    ): Promise<Despacho>;

    /**
     * Tracking ya normalizado (cabecera + eventos). Mismo shape sea cual sea el
     * courier: lo garantiza el Adapter (toEnvioTracking).
     */
    tracking(
        pedidoId: number | string,
        historial?: boolean,
    ): Promise<EnvioTracking>;
}
