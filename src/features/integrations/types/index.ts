import type { ID, ISODateTime, CLP } from '@/types/api';
import type {
  EstadoPedido,
  PrioridadMedica,
  TipoDespacho,
} from '@/types/models';

/**
 * Tipos del modulo Integraciones:
 * - Creacion de pedidos B2B desde el ERP de una institucion (autenticacion por
 *   API Key en el header `X-Api-Key`).
 * - Gestion de API Clients / API Keys (autenticacion JWT, solo trabajadores).
 */

// ---------------------------------------------------------------------------
// Pedido B2B (ERP de clinicas)
// ---------------------------------------------------------------------------

/** Tipo de venta permitido para pedidos B2B. */
export type TipoVentaB2B = 'TRANSFERENCIA' | 'CREDITO_INSTITUCIONAL';

/** Linea de un pedido B2B (entrada, se identifica por SKU). */
export interface LineaPedidoB2BInput {
  producto_sku: string;
  /** Minimo 1. */
  cantidad: number;
  /** Si no se envia, se aplica FEFO. */
  lote_id?: ID;
  observacion?: string;
}

/** Cuerpo de POST /api/integrations/pedidos/. */
export interface CrearPedidoB2BRequest {
  sucursal_id: ID;
  /** Si se omite, usa la direccion principal de la institucion. */
  direccion_entrega_id?: ID;
  /** Por defecto CREDITO_INSTITUCIONAL. */
  tipo_venta?: TipoVentaB2B;
  /** Por defecto NORMAL. */
  tipo_despacho?: TipoDespacho;
  /** Por defecto NORMAL. */
  prioridad_medica?: PrioridadMedica;
  fecha_requerida_entrega?: ISODateTime;
  /** Orden interna del ERP para trazabilidad. */
  referencia_erp?: string;
  observacion?: string;
  lineas: LineaPedidoB2BInput[];
}

/** Linea de un pedido B2B (salida). */
export interface LineaPedidoB2BResponse {
  producto_sku: string;
  producto_nombre: string;
  lote_id: ID;
  cantidad: number;
  precio_unitario: CLP;
  subtotal: CLP;
}

/** Respuesta 201 al crear un pedido B2B. */
export interface CrearPedidoB2BResponse {
  pedido_id: ID;
  referencia_erp: string;
  estado: EstadoPedido;
  institucion: string;
  total: CLP;
  monto_neto: CLP;
  monto_iva: CLP;
  lineas: LineaPedidoB2BResponse[];
  fecha_creacion: ISODateTime;
  mensaje: string;
}

// ---------------------------------------------------------------------------
// API Clients / API Keys
// ---------------------------------------------------------------------------

/** Metadata de un ApiClient en listado (no expone la key). */
export interface ApiClient {
  id: ID;
  institucion: string;
  institucion_id: ID;
  nombre_cliente_api: string;
  activo: boolean;
  limite_requests_diario: number;
  fecha_creacion: ISODateTime;
  fecha_expiracion: ISODateTime | null;
  vencida: boolean;
}

/** Detalle de un ApiClient (no incluye institucion_id ni vencida). */
export interface ApiClientDetalle {
  id: ID;
  institucion: string;
  nombre_cliente_api: string;
  activo: boolean;
  limite_requests_diario: number;
  fecha_creacion: ISODateTime;
  fecha_expiracion: ISODateTime | null;
}

/** Cuerpo de POST /api/integrations/api-clients/crear/. */
export interface CrearApiClientRequest {
  institucion_id: ID;
  nombre_cliente_api: string;
  /** Por defecto 1000. */
  limite_requests_diario?: number;
  /** ISO 8601. Si se omite, la key no expira. */
  fecha_expiracion?: ISODateTime | null;
}

/**
 * Respuesta 201 al crear una API Key.
 * IMPORTANTE: `api_key` solo aparece en esta respuesta y no puede recuperarse.
 */
export interface CrearApiClientResponse {
  id: ID;
  institucion: string;
  nombre_cliente_api: string;
  api_key: string;
  activo: boolean;
  limite_requests_diario: number;
  fecha_expiracion: ISODateTime | null;
  fecha_creacion: ISODateTime;
  advertencia: string;
}

/** Cuerpo de PATCH /api/integrations/api-clients/{id}/ (todos opcionales). */
export interface ActualizarApiClientRequest {
  activo?: boolean;
  limite_requests_diario?: number;
  fecha_expiracion?: ISODateTime | null;
  /** Si es true, genera una nueva key y la anterior queda invalida. */
  rotar_key?: boolean;
}

/**
 * Respuesta al actualizar un ApiClient.
 * `nueva_api_key` y `advertencia` solo aparecen cuando `rotar_key` es true.
 */
export interface ActualizarApiClientResponse {
  id: ID;
  institucion: string;
  activo: boolean;
  limite_requests_diario: number;
  fecha_expiracion: ISODateTime | null;
  mensaje: string;
  nueva_api_key?: string;
  advertencia?: string;
}
