

// ---- Enums como uniones literales (T0.3 / P4) ----
export type EstadoPedido =
    | 'PENDIENTE'
    | 'APROBADO'
    | 'RECHAZADO'
    | 'EN_PICKING'
    | 'DESPACHADO'
    | 'ENTREGADO'
    | 'CANCELADO';

export type TipoVenta =
    | 'WEBPAY'
    | 'TRANSFERENCIA'
    | 'MAYORISTA'
    | 'CREDITO_INSTITUCIONAL';

export type TipoDespacho = 'NORMAL' | 'EXPRESS';
export type PrioridadMedica = 'NORMAL' | 'ALTA' | 'CRITICA';
export type AccionAprobacion = 'APROBADO' | 'RECHAZADO';

// ---- DTOs de respuesta (espejo de la documentación) ----
export interface DetallePedidoDTO {
  id: number;
  producto_id: number;
  producto_sku: string;
  producto_nombre: string;
  lote_id: number | null;
  lote_codigo: string | null;
  cantidad: number;
  cantidad_preparada: number;
  precio_unitario_historico: number; // neto CLP
  descuento: number;
  subtotal: number;
  observacion: string;
}

export interface PedidoDTO {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  sucursal_origen_id: number;
  sucursal_nombre: string;
  direccion_entrega_id: number;
  estado_pedido: EstadoPedido;
  tipo_venta: TipoVenta;
  tipo_despacho: TipoDespacho;
  prioridad_medica: PrioridadMedica;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_requerida_entrega: string | null;
  subtotal: number;
  descuento_total: number;
  monto_neto: number;
  monto_iva: number;
  total: number;
  observacion: string;
  detalles: DetallePedidoDTO[];
}

/** Respuesta reducida del endpoint aprobar/rechazar. */
export interface AprobacionDTO {
  pedido_id: number;
  estado_pedido: EstadoPedido;
  comentario: string;
}

// ---- Payloads de request ----
export interface NuevoDetalle {
  producto_id: number;
  cantidad: number;
  lote_id?: number;
  observacion?: string;
}

export interface NuevoPedido {
  direccion_entrega_id: number;

  sucursal_origen_id: number;
  tipo_venta: TipoVenta;
  tipo_despacho?: TipoDespacho;
  prioridad_medica?: PrioridadMedica;
  fecha_requerida_entrega?: string;
  observacion?: string;
  detalles: NuevoDetalle[];
}

/** PATCH cliente (estado PENDIENTE/APROBADO). */
export interface EditarPedido {
  direccion_entrega?: number;
  tipo_despacho?: TipoDespacho;
  prioridad_medica?: PrioridadMedica;
  fecha_requerida_entrega?: string;
  observacion?: string;
}

export interface AprobarPedido {
  accion: AccionAprobacion;
  comentario?: string;
}


export interface FiltroPedidos {
  estado_pedido?: EstadoPedido;
  prioridad_medica?: PrioridadMedica;
  tipo_despacho?: TipoDespacho;
  tipo_venta?: TipoVenta;
  sucursal_origen_id?: number;
  cliente_id?: number;
  search?: string;
}
