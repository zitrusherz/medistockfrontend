import type { ID, ISODateTime, CLP } from '@/types/api';
import type { EstadoEnvio, TipoDespacho } from '@/types/models';

/**
 * Tipos del modulo Logistica (integracion Chilexpress):
 * cotizacion, creacion de envio, tracking y actualizacion de estado.
 */



/** Producto manual para cotizar (cuando no se cotiza por pedido). */
export interface ProductoCotizacion {
  peso_mg: number;
  largo_mm: number;
  ancho_mm: number;
  alto_mm: number;
  /** Por defecto 1. */
  cantidad: number;
  /** Valor declarado. Por defecto 0. */
  valor_unitario?: CLP;
}

/**
 * Cuerpo de POST /api/logistics/cotizar/.
 * Se cotiza con `pedido_id` O con `sucursal_id` + `productos`.
 * `county_code_destino` siempre es requerido.
 */
export interface CotizarEnvioRequest {
  county_code_destino: string;
  pedido_id?: ID;
  sucursal_id?: ID;
  productos?: ProductoCotizacion[];
}


export interface CotizarProductosRequest {
  county_code_destino: string;
  sucursal_id: ID;
  productos_ids: number[];
}

/** Servicio de envio disponible (passthrough de Chilexpress, en camelCase). */
export interface ServicioCotizado {
  serviceTypeCode: number;
  serviceDescription: string;
  finalWeight: string;
  serviceValue: string;
  deliveryType: number;
}

/** Respuesta de cotizacion. */
export interface CotizacionResponse {
  origin_county_code: string;
  destination_county_code: string;
  servicios_disponibles: ServicioCotizado[];
  pedido_id: ID | null;
  num_cajas: number;
}



/**
 * Despacho asociado a un pedido.
 * Es tambien la respuesta directa de PATCH .../estado/.
 */
export interface Despacho {
  id: ID;
  pedido_id: ID;
  courier_nombre: string;
  numero_seguimiento: string;
  estado_envio: EstadoEnvio;
  tipo_despacho: TipoDespacho;
  fecha_despacho: ISODateTime | null;
  fecha_entrega_estimada: ISODateTime | null;
  costo_despacho: CLP;
  url_etiqueta: string;
}

/** Tipo de etiqueta a generar (0=datos, 1=EPL, 2=binaria). */
export type LabelType = 0 | 1 | 2;

/** Cuerpo de POST /api/logistics/envios/. */
export interface CrearEnvioRequest {
  pedido_id: ID;
  /** ServiceTypeCode obtenido de la cotizacion. */
  service_type_code: number;
  /** Por defecto 2 (binaria). */
  label_type?: LabelType;
  contacto_nombre?: string;
  contacto_telefono?: string;
  contacto_email?: string;
}

/** Respuesta 201 al crear un envio. */
export interface CrearEnvioResponse {
  despacho: Despacho;
  numero_ot: string;
  num_cajas: number;
  etiqueta_disponible: boolean;
  service_description: string;
}



/**
 * Evento de tracking. La doc muestra `tracking: []` (vacio) sin detallar la
 * forma de cada evento, por lo que se deja permisivo.
 */
export type TrackingEvento = Record<string, unknown>;

/** Respuesta de GET .../tracking/. */
export interface TrackingResponse {
  data: {
    tracking: TrackingEvento[];
  };
}



/** Estados a los que se puede transicionar manualmente un despacho. */
export type NuevoEstadoEnvio =
  | 'RETIRADO'
  | 'EN_TRANSITO'
  | 'ENTREGADO'
  | 'DEVUELTO'
  | 'CANCELADO';

/** Cuerpo de PATCH /api/logistics/envios/{pedido_id}/estado/. */
export interface ActualizarEstadoDespachoRequest {
  nuevo_estado: NuevoEstadoEnvio;
  observacion?: string;
}
