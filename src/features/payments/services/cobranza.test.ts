// Ruta destino: src/features/payments/services/cobranza.test.ts
import { describe, it, expect } from 'vitest'
import {
    calcularCobranza,
    totalPorCobrarGlobal,
    totalVencidoGlobal,
    totalPedidosPorCobrar,
} from './cobranza'
import type { Pago, Pedido } from '@/types/models'

// "Hoy" fijo para que el cálculo de días de mora sea determinista.
const AHORA = new Date('2026-07-01T00:00:00').getTime()
const DIAS_CREDITO = 30

const pedido = (overrides: Partial<Pedido>): Pedido =>
    ({
        id: 0,
        clienteId: 0,
        cliente: '',
        estado: 'APROBADO',
        tipoVenta: 'WEBPAY',
        total: 0,
        fechaCreacion: AHORA_ISO(0),
        ...overrides,
    }) as Pedido

// Genera una fecha ISO a N días antes de AHORA (para fijar diasMora esperado).
function AHORA_ISO(diasAntes: number): string {
    const d = new Date(AHORA - diasAntes * 86_400_000)
    return d.toISOString()
}

const pago = (overrides: Partial<Pago>): Pago =>
    ({
        id: 0,
        pedidoId: 0,
        estadoPago: 'RECHAZADO',
        fechaCreacion: AHORA_ISO(0),
        clienteId: null,
        clienteRut: null,
        clienteEmail: null,
        ...overrides,
    }) as Pago

describe('calcularCobranza', () => {
    it('excluye pedidos PENDIENTE, RECHAZADO y CANCELADO (no son deuda exigible)', () => {
        const pedidos = [
            pedido({ id: 1, clienteId: 1, estado: 'PENDIENTE', total: 1000 }),
            pedido({ id: 2, clienteId: 1, estado: 'RECHAZADO', total: 1000 }),
            pedido({ id: 3, clienteId: 1, estado: 'CANCELADO', total: 1000 }),
        ]
        expect(calcularCobranza([], pedidos)).toEqual([])
    })

    it('excluye pedidos que ya tienen un pago CONFIRMADO', () => {
        const pedidos = [pedido({ id: 1, clienteId: 1, estado: 'APROBADO', total: 1000 })]
        const pagos = [pago({ pedidoId: 1, estadoPago: 'CONFIRMADO' })]
        expect(calcularCobranza(pagos, pedidos)).toEqual([])
    })

    it('agrupa por cliente, calcula vencido según diasCredito y ordena por total desc', () => {
        const pedidos: Pedido[] = [
            // cliente 1: uno vencido (61 días) + uno vigente (6 días) = 3000 total, 1000 vencido
            pedido({
                id: 1,
                clienteId: 1,
                cliente: 'Clínica Andes',
                estado: 'APROBADO',
                total: 1000,
                fechaCreacion: AHORA_ISO(61),
            }),
            pedido({
                id: 2,
                clienteId: 1,
                cliente: 'Clínica Andes',
                estado: 'ENTREGADO',
                total: 2000,
                fechaCreacion: AHORA_ISO(6),
            }),
            // cliente 4: uno vigente por 5000 (no vencido)
            pedido({
                id: 6,
                clienteId: 4,
                cliente: 'Hospital Sur',
                estado: 'DESPACHADO',
                total: 5000,
                fechaCreacion: AHORA_ISO(5),
            }),
        ]
        const pagos: Pago[] = [
            pago({ pedidoId: 1, estadoPago: 'RECHAZADO', clienteId: 1, clienteRut: '1-9' }),
        ]

        const cuentas = calcularCobranza(pagos, pedidos, { ahora: AHORA, diasCredito: DIAS_CREDITO })

        expect(cuentas).toHaveLength(2)
        // ordenado desc por totalPorCobrar: Hospital Sur (5000) antes que Clínica Andes (3000)
        expect(cuentas[0]?.clienteId).toBe(4)
        expect(cuentas[0]?.totalPorCobrar).toBe(5000)
        expect(cuentas[0]?.tieneVencidos).toBe(false)

        const clinica = cuentas[1]!
        expect(clinica.clienteId).toBe(1)
        expect(clinica.cantidadPedidos).toBe(2)
        expect(clinica.totalPorCobrar).toBe(3000)
        expect(clinica.totalVencido).toBe(1000)
        expect(clinica.tieneVencidos).toBe(true)
        expect(clinica.diasMoraMax).toBe(61)
        expect(clinica.rut).toBe('1-9')
    })
})

describe('totales globales', () => {
    const cuentas = calcularCobranza(
        [pago({ pedidoId: 1, estadoPago: 'RECHAZADO', clienteId: 1 })],
        [
            pedido({
                id: 1,
                clienteId: 1,
                estado: 'APROBADO',
                total: 1000,
                fechaCreacion: AHORA_ISO(61),
            }),
            pedido({
                id: 2,
                clienteId: 2,
                estado: 'APROBADO',
                total: 2000,
                fechaCreacion: AHORA_ISO(5),
            }),
        ],
        { ahora: AHORA, diasCredito: DIAS_CREDITO },
    )

    it('totalPorCobrarGlobal suma todas las cuentas', () => {
        expect(totalPorCobrarGlobal(cuentas)).toBe(3000)
    })

    it('totalVencidoGlobal suma solo lo vencido', () => {
        expect(totalVencidoGlobal(cuentas)).toBe(1000)
    })

    it('totalPedidosPorCobrar cuenta los pedidos, no los clientes', () => {
        expect(totalPedidosPorCobrar(cuentas)).toBe(2)
    })
})
