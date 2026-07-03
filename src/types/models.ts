import type { ID, ISODateTime } from './api';
import type { Grupo } from './roles';

/**
 * Modelos y enumeraciones de dominio compartidos por varias features.
 * Todo lo que aparece en mas de un modulo de la API vive aqui para evitar
 * duplicacion (usuarios, ubicaciones, enums de estado, etc.).
 */



/** Tipo de cliente. */
export type TipoCliente = 'PARTICULAR' | 'INSTITUCIONAL';

/** Modalidad de venta de un pedido. */
export type TipoVenta =
    | 'WEBPAY'
    | 'TRANSFERENCIA'
    | 'MAYORISTA'
    | 'CREDITO_INSTITUCIONAL';

/** Tipo de despacho. */
export type TipoDespacho = 'NORMAL' | 'EXPRESS';

/** Prioridad medica del pedido (urgencia). */
export type PrioridadMedica = 'NORMAL' | 'ALTA' | 'CRITICA';

/**
 * Estado de un pedido.
 * Valores vistos en la doc: PENDIENTE, APROBADO, RECHAZADO, EN_PICKING.
 * Es probable que el backend tenga estados adicionales (p. ej. ENVIADO,
 * ENTREGADO, CANCELADO); se incluyen como inferencia y conviene confirmarlos.
 */
export type EstadoPedido =
    | 'PENDIENTE'
    | 'APROBADO'
    | 'RECHAZADO'
    | 'EN_PICKING'
    // Inferidos (confirmar con backend):
    | 'DESPACHADO'
    | 'ENTREGADO'
    | 'CANCELADO';

/** Estado de una transaccion de pago. */
export type EstadoPago =
    | 'PENDIENTE'
    | 'INICIADO'
    | 'AUTORIZADO'
    | 'CONFIRMADO'
    | 'RECHAZADO'
    | 'ANULADO'
    | 'REEMBOLSADO'
    | 'ERROR';

/** Metodo de pago de una transaccion. */
export type MetodoPago =
    | 'WEBPAY'
    | 'MERCADOPAGO'
    | 'TRANSFERENCIA'
    | 'CREDITO_INSTITUCIONAL';

/** Estado de un despacho/envio. */
export type EstadoEnvio =
    | 'PENDIENTE'
    | 'RETIRADO'
    | 'EN_TRANSITO'
    | 'ENTREGADO'
    | 'DEVUELTO'
    | 'CANCELADO';

/** Tipo de movimiento de inventario. */
export type TipoMovimiento =
    | 'ENTRADA'
    | 'SALIDA'
    | 'AJUSTE'
    | 'MERMA'
    | 'DEVOLUCION'
    | 'TRASLADO'
    | 'RESERVA';

/**
 * Estado de un traslado entre sucursales.
 * Vistos en la doc: SOLICITADO, EN_TRANSITO. Los demas son inferencia.
 */
export type EstadoTraslado =
    | 'SOLICITADO'
    | 'EN_TRANSITO'
    // Inferidos (confirmar con backend):
    | 'RECIBIDO'
    | 'CANCELADO';



/** Forma reducida de usuario (respuestas de registro). */
export interface UsuarioBasico {
    id: ID;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

/** Forma extendida de usuario (listados de trabajadores/clientes). */
export interface UsuarioDetalle extends UsuarioBasico {
    rut: string;
    grupos: Grupo[];
    is_active: boolean;
    is_staff: boolean;
    date_joined: ISODateTime;
}

/** Datos de usuario al registrarse (incluye confirmacion de password). */
export interface UsuarioRegistro {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password2: string;
}



/** Referencia minima a una region ({ id, nombre }). */
export interface RegionRef {
    id: ID;
    nombre: string;
}

/** Region completa con su mapeo a Chilexpress. */
export interface Region extends RegionRef {
    chilexpress_region_id: number;
}

/** Referencia minima a una comuna ({ id, nombre }). */
export interface ComunaRef {
    id: ID;
    nombre: string;
}

/** Datos de cobertura Chilexpress para una comuna. */
export interface ChilexpressComuna {
    county_code: string;
    county_name: string;
    coverage_name: string;
    retorna_respuesta: boolean;
}

/** Comuna con cobertura (endpoint GET /api/locations/comunas/). */
export interface Comuna {
    id: ID;
    nombre: string;
    region: Region;
    chilexpress: ChilexpressComuna;
}

/** Region con sus comunas anidadas (regions-with-comunas). */
export interface RegionConComunas extends Region {
    comunas: Comuna[];
}

/** Sucursal en su forma publica (GET /api/locations/sucursales/{id}/). */
export interface Sucursal {
    id: ID;
    nombre: string;
    direccion: string;
    num_direccion: string;
    telefono: string;
    comuna: ComunaRef;
    region: RegionRef;
    county_code: string;
    activo: boolean;
}

/** Referencia a una institucion (cliente institucional). */
export interface InstitucionRef {
    id: ID;
    razon_social: string;
    rut_empresa: string;
}

/** dejar de centralizar a futuro**/


export interface StockSucursal {
    sucursalId: number;
    sucursalNombre: string;
    stock: number;
}

export interface Product {
    id: number;
    code: string;            // sku
    name: string;
    brand: string;
    brandId: number | null;
    categories: string[];
    unit: string;
    description: string;
    registroSanitario: string | null;
    requiereControlVencimiento: boolean;
    esCaja: boolean;
    activo: boolean;
    priceNeto: number;       // CLP entero
    priceIva: number;        // CLP entero
    stockBySucursal: StockSucursal[];
    stockTotal: number;      // derivado
    imageUrl: string | null; // URL absoluta servida por el backend (media/), o null si no tiene
}

export interface Marca { id: number; nombre: string; activo: boolean; }
export interface Categoria { id: number; nombre: string; activo: boolean; }

export interface DetallePedido {
    id: number;
    productoId: number;
    productoSku: string;
    productoNombre: string;
    loteId: number | null;
    loteCodigo: string | null;
    cantidad: number;
    cantidadPreparada: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    observacion: string;
}

export interface Pedido {
    id: number;
    clienteId: number;
    cliente: string;
    sucursalId: number;
    sucursalNombre: string;
    direccionEntregaId: number;
    estado: EstadoPedido;
    tipoVenta: TipoVenta;
    tipoDespacho: TipoDespacho;
    prioridad: PrioridadMedica;
    fechaCreacion: string;
    fechaActualizacion: string;
    fechaRequeridaEntrega: string | null;
    subtotal: number;
    descuentoTotal: number;
    montoNeto: number;
    montoIva: number;
    total: number;
    observacion: string;
    detalles: DetallePedido[];
}


export interface Pago {
    id: number;
    pedidoId: number;
    pedidoTotal: number;
    metodoPago: MetodoPago;
    estadoPago: EstadoPago;
    montoConfirmado: number;
    buyOrder: string;
    authorizationCode: string | null;
    cardLastDigits: string | null;
    paymentTypeCode: string | null;
    webpayStatus: string | null;
    responseCode: number | null;
    transactionDate: string | null;
    fechaCreacion: string;
    fechaConfirmacion: string | null;
    observacion: string;
    // opcional (solo GET todos/)
    clienteId?: number;
    clienteNombre?: string;
    clienteRut?: string;
    clienteEmail?: string;
}