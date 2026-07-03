import type { ID, ISODateTime, CLP } from '@/types/api';
import type { EstadoPago, EstadoPedido, MetodoPago } from '@/types/models';

/**
 * Tipos del modulo Pagos (integracion Webpay Plus / Transbank).
 */



/** Estado de la transaccion segun Webpay. */
export type WebpayStatus = 'AUTHORIZED' | 'FAILED' | string;

/** Transaccion de pago completa (vista del cliente). */
export interface TransaccionPago {
  id: ID;
  pedido: ID;
  pedido_id: ID;
  pedido_total: CLP;
  metodo_pago: MetodoPago;
  estado_pago: EstadoPago;
  monto_confirmado: CLP;
  buy_order: string;
  session_id: string;
  token_ws: string;
  id_transaccion_externa: string;
  authorization_code: string | null;
  response_code: number | null;
  payment_type_code: string | null;
  installments_number: number | null;
  card_last_digits: string | null;
  webpay_status: WebpayStatus | null;
  transaction_date: ISODateTime | null;
  raw_response: Record<string, unknown> | null;
  fecha_creacion: ISODateTime;
  fecha_confirmacion: ISODateTime | null;
  observacion: string;
}

/**
 * Transaccion enriquecida con datos de cliente y pedido
 * (GET /api/payments/todos/, solo trabajadores).
 */
export interface PagoEnriquecido {
  id: ID;
  pedido_id: ID;
  pedido_total: CLP;
  cliente_id: ID;
  cliente_nombre: string;
  cliente_rut: string;
  cliente_email: string;
  metodo_pago: MetodoPago;
  estado_pago: EstadoPago;
  monto_confirmado: CLP;
  buy_order: string;
  authorization_code: string | null;
  response_code: number | null;
  payment_type_code: string | null;
  installments_number: number | null;
  card_last_digits: string | null;
  webpay_status: WebpayStatus | null;
  transaction_date: ISODateTime | null;
  fecha_creacion: ISODateTime;
  fecha_confirmacion: ISODateTime | null;
  observacion: string;
}

/** Filtros (query params) para GET /api/payments/todos/. */
export interface TodosPagosFilters {
  estado_pago?: EstadoPago;
  metodo_pago?: MetodoPago;
}



/** Cuerpo de POST /api/payments/webpay/iniciar/. */
export interface IniciarPagoWebpayRequest {
  pedido_id: ID;
}

/** Respuesta 201 al iniciar un pago (transaccion nueva). */
export interface IniciarPagoWebpayResponse {
  transaccion_pago_id: ID;
  pedido_id: ID;
  buy_order: string;
  session_id: string;
  amount: CLP;
  token: string;
  url: string;
  redirect_url: string;
}

/** Respuesta 200 cuando ya existia una transaccion iniciada. */
export interface IniciarPagoWebpayExistenteResponse {
  detail: string;
  transaccion_pago: TransaccionPago;
}



/** Cuerpo de POST /api/payments/webpay/commit/. */
export interface CommitWebpayRequest {
  token_ws: string;
}

/** Resultado Webpay resumido (status + response_code). */
export interface WebpayResultado {
  status: WebpayStatus;
  response_code: number;
}

/** Respuesta de commit Webpay. */
export interface CommitWebpayResponse {
  transaccion_pago_id: ID;
  pedido_id: ID;
  aprobada: boolean;
  estado_pago: EstadoPago;
  estado_pedido: EstadoPedido;
  webpay: WebpayResultado;
  despacho: {
    id: ID;
    estado_envio: string;
    creado: boolean;
  };
}



/** Respuesta de GET /api/payments/webpay/estado/{token_ws}/. */
export interface EstadoWebpayResponse {
  transaccion_pago: TransaccionPago;
  webpay: WebpayResultado;
}
