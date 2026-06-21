import type { ID, ISODate, ISODateTime, CLP } from '@/types/api';
import type { TipoMovimiento, EstadoTraslado } from '@/types/models';

/**
 * Tipos del modulo Inventario:
 * categorias, marcas, productos, lotes, inventarios, movimientos y traslados.
 */

// ---------------------------------------------------------------------------
// Categorias y marcas
// ---------------------------------------------------------------------------

export interface Categoria {
  id: ID;
  nombre: string;
  activo: boolean;
}

/** Cuerpo para crear/editar una categoria. */
export interface CategoriaInput {
  nombre: string;
  /** Por defecto true. */
  activo?: boolean;
}

export interface Marca {
  id: ID;
  nombre: string;
  activo: boolean;
}

/** Cuerpo para crear/editar una marca. */
export interface MarcaInput {
  nombre: string;
  /** Por defecto true. */
  activo?: boolean;
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

/** Relacion producto-categoria tal como se anida en un Producto. */
export interface ProductoCategoriaLink {
  id: ID;
  categoria: Categoria;
}

/**
 * Producto completo (GET /api/inventory/productos/).
 * Nota: el serializer de productos NO incluye `precio_con_iva`
 * (ese campo si aparece en el catalogo y en ProductoResumen).
 */
export interface Producto {
  id: ID;
  sku: string;
  nombre: string;
  descripcion: string;
  valor_unitario: CLP;
  marca: Marca;
  marca_id: ID;
  categorias: ProductoCategoriaLink[];
  unidad_medida: string;
  largo_mm: number;
  ancho_mm: number;
  alto_mm: number;
  peso_mg: number;
  volumen_ml: number;
  requiere_control_vencimiento: boolean;
  registro_sanitario: string;
  activo: boolean;
  es_caja: boolean;
}

/** Cuerpo para crear/editar un producto. */
export interface ProductoInput {
  sku: string;
  nombre: string;
  descripcion?: string;
  valor_unitario: CLP;
  marca_id: ID;
  unidad_medida: string;
  largo_mm?: number;
  ancho_mm?: number;
  alto_mm?: number;
  peso_mg?: number;
  volumen_ml?: number;
  requiere_control_vencimiento?: boolean;
  registro_sanitario?: string;
  activo?: boolean;
  es_caja?: boolean;
}

/**
 * Forma reducida de producto que se anida dentro de un Lote.
 * Incluye `precio_con_iva` (a diferencia del Producto completo).
 */
export interface ProductoResumen {
  id: ID;
  sku: string;
  nombre: string;
  valor_unitario: CLP;
  precio_con_iva: CLP;
  marca_nombre: string;
  unidad_medida: string;
}

// ---------------------------------------------------------------------------
// Lotes
// ---------------------------------------------------------------------------

export interface Lote {
  id: ID;
  producto: ProductoResumen;
  producto_id: ID;
  codigo_lote: string;
  fecha_elaboracion: ISODate;
  fecha_vencimiento: ISODate;
  dias_para_vencer: number;
  activo: boolean;
}

/** Cuerpo para crear/editar un lote. */
export interface LoteInput {
  producto_id: ID;
  codigo_lote: string;
  fecha_elaboracion: ISODate;
  fecha_vencimiento: ISODate;
  activo?: boolean;
}

/** Referencia minima a un lote (usada en detalles de traslado). */
export interface LoteRef {
  id: ID;
  codigo_lote: string;
  fecha_vencimiento: ISODate;
}

// ---------------------------------------------------------------------------
// Inventarios (stock por sucursal/lote)
// ---------------------------------------------------------------------------

export interface Inventario {
  id: ID;
  lote: Lote;
  lote_id: ID;
  /** ID de la sucursal. */
  sucursal: ID;
  sucursal_nombre: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
  stock_neto: number;
  stock_critico: number;
  alerta_stock_critico: boolean;
  fecha_actualizacion: ISODateTime;
}

/** Cuerpo para crear/editar un inventario. */
export interface InventarioInput {
  lote_id: ID;
  /** ID de la sucursal. */
  sucursal: ID;
  cantidad_disponible: number;
  cantidad_reservada?: number;
  stock_critico?: number;
}

// ---------------------------------------------------------------------------
// Movimientos de inventario
// ---------------------------------------------------------------------------

export interface MovimientoInventario {
  id: ID;
  inventario_id: ID;
  /** ID del usuario que registro el movimiento. */
  usuario: ID | null;
  usuario_nombre: string;
  pedido: ID | null;
  compra_proveedor: ID | null;
  traslado_inventario: ID | null;
  tipo_movimiento: TipoMovimiento;
  tipo_movimiento_display: string;
  cantidad: number;
  fecha_movimiento: ISODateTime;
  motivo: string;
  observacion: string;
}

/** Cuerpo para registrar un movimiento. */
export interface MovimientoInventarioInput {
  inventario_id: ID;
  pedido?: ID | null;
  compra_proveedor?: ID | null;
  traslado_inventario?: ID | null;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  motivo?: string;
  observacion?: string;
}

// ---------------------------------------------------------------------------
// Traslados entre sucursales
// ---------------------------------------------------------------------------

export interface DetalleTraslado {
  id: ID;
  lote: LoteRef;
  lote_id: ID;
  cantidad: number;
}

export interface Traslado {
  id: ID;
  /** ID sucursal origen. */
  sucursal_origen: ID;
  sucursal_origen_nombre: string;
  /** ID sucursal destino. */
  sucursal_destino: ID;
  sucursal_destino_nombre: string;
  /** ID del usuario solicitante. */
  solicitado_por: ID;
  fecha_solicitud: ISODateTime;
  fecha_envio: ISODateTime | null;
  fecha_recepcion: ISODateTime | null;
  estado: EstadoTraslado;
  observacion: string;
  detalles: DetalleTraslado[];
}

/** Linea de un traslado al momento de crearlo. */
export interface DetalleTrasladoInput {
  lote_id: ID;
  cantidad: number;
}

/** Cuerpo para crear un traslado. */
export interface TrasladoInput {
  sucursal_origen: ID;
  sucursal_destino: ID;
  observacion?: string;
  detalles_write: DetalleTrasladoInput[];
}

// ---------------------------------------------------------------------------
// Ingreso combinado (crea producto + lote + stock en una sola llamada)
// ---------------------------------------------------------------------------

/** Cuerpo de POST /api/inventory/ingresar-producto/. */
export interface IngresarProductoRequest {
  sku: string;
  nombre: string;
  descripcion?: string;
  valor_unitario: CLP;
  marca_id: ID;
  unidad_medida: string;
  requiere_control_vencimiento?: boolean;
  registro_sanitario?: string;
  es_caja?: boolean;
  largo_mm?: number;
  ancho_mm?: number;
  alto_mm?: number;
  peso_mg?: number;
  volumen_ml?: number;
  categoria_ids?: ID[];
  codigo_lote: string;
  fecha_elaboracion: ISODate;
  fecha_vencimiento: ISODate;
  sucursal_id: ID;
  cantidad: number;
  stock_critico?: number;
  motivo?: string;
  observacion?: string;
}

/** Respuesta 201 de ingresar-producto. */
export interface IngresarProductoResponse {
  mensaje: string;
  producto_id: ID;
  sku: string;
  lote_id: ID;
  codigo_lote: string;
  inventario_id: ID;
  sucursal_id: ID;
  stock_actual: number;
  movimiento_id: ID;
}
