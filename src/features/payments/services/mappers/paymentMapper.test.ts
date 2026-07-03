// Ruta destino: src/features/payments/services/mappers/paymentMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toPago, toPagoEnriquecido } from './paymentMapper'
import type { TransaccionPago, PagoEnriquecido } from '../../types'

const transaccionDTO = (
    overrides: Partial<TransaccionPago> = {},
): TransaccionPago =>
    ({
        id: 1,
        pedido_id: 100,
        pedido_total: 7140,
        metodo_pago: 'WEBPAY',
        estado_pago: 'CONFIRMADO',
        monto_confirmado: 7140,
        buy_order: 'OC-1',
        authorization_code: 'AUTH-1',
        card_last_digits: '6623',
        payment_type_code: 'VD',
        webpay_status: 'AUTHORIZED',
        response_code: 0,
        transaction_date: '2026-06-01T10:05:00Z',
        fecha_creacion: '2026-06-01T10:00:00Z',
        fecha_confirmacion: '2026-06-01T10:05:00Z',
        observacion: '',
        ...overrides,
    }) as TransaccionPago

describe('toPago', () => {
    it('mapea snake_case -> camelCase', () => {
        const p = toPago(transaccionDTO())

        expect(p.pedidoId).toBe(100)
        expect(p.authorizationCode).toBe('AUTH-1')
        expect(p.cardLastDigits).toBe('6623')
        expect(p.estadoPago).toBe('CONFIRMADO')
    })

    it('observacion null cae a string vacío', () => {
        const p = toPago(
            transaccionDTO({
                observacion: null as unknown as string,
            }),
        )

        expect(p.observacion).toBe('')
    })
})

describe('toPagoEnriquecido', () => {
    it('incluye los mismos campos que toPago más los datos del cliente', () => {
        const dto = {
            ...transaccionDTO(),
            cliente_id: 5,
            cliente_nombre: 'Clínica Andes',
            cliente_rut: '76.123.456-7',
            cliente_email: 'contacto@clinicaandes.cl',
        } as PagoEnriquecido

        const p = toPagoEnriquecido(dto)

        expect(p.pedidoId).toBe(100)
        expect(p.clienteId).toBe(5)
        expect(p.clienteNombre).toBe('Clínica Andes')
        expect(p.clienteRut).toBe('76.123.456-7')
        expect(p.clienteEmail).toBe('contacto@clinicaandes.cl')
    })
})