// features/payments/services/mappers/paymentMapper.ts
// Adapter: DTO crudo -> modelo Pago de la UI. camelCase + card a 4 digitos.

import type { Pago } from '@/types/models';
import type { TransaccionPago, PagoEnriquecido } from '../../types';

/** TransaccionPago (mis-pagos, estado) -> Pago. */
export const toPago = (dto: TransaccionPago): Pago => ({
    id: dto.id,
    pedidoId: dto.pedido_id,
    pedidoTotal: dto.pedido_total,
    metodoPago: dto.metodo_pago,
    estadoPago: dto.estado_pago,
    montoConfirmado: dto.monto_confirmado,
    buyOrder: dto.buy_order,
    authorizationCode: dto.authorization_code,
    cardLastDigits: dto.card_last_digits,
    paymentTypeCode: dto.payment_type_code,
    webpayStatus: dto.webpay_status,
    responseCode: dto.response_code,
    transactionDate: dto.transaction_date,
    fechaCreacion: dto.fecha_creacion,
    fechaConfirmacion: dto.fecha_confirmacion,
    observacion: dto.observacion ?? '',
});

/** PagoEnriquecido (todos, trabajadores) -> Pago + datos cliente. */
export const toPagoEnriquecido = (dto: PagoEnriquecido): Pago => ({
    id: dto.id,
    pedidoId: dto.pedido_id,
    pedidoTotal: dto.pedido_total,
    metodoPago: dto.metodo_pago,
    estadoPago: dto.estado_pago,
    montoConfirmado: dto.monto_confirmado,
    buyOrder: dto.buy_order,
    authorizationCode: dto.authorization_code,
    cardLastDigits: dto.card_last_digits,
    paymentTypeCode: dto.payment_type_code,
    webpayStatus: dto.webpay_status,
    responseCode: dto.response_code,
    transactionDate: dto.transaction_date,
    fechaCreacion: dto.fecha_creacion,
    fechaConfirmacion: dto.fecha_confirmacion,
    observacion: dto.observacion ?? '',
    // extra de trabajador
    clienteId: dto.cliente_id,
    clienteNombre: dto.cliente_nombre,
    clienteRut: dto.cliente_rut,
    clienteEmail: dto.cliente_email,
});