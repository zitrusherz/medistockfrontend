// Ruta destino: src/features/orders/services/mappers/orderMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toDetallePedido, toPedido } from './orderMapper'
import type { PedidoDTO, DetallePedidoDTO } from '../../types'

const detalleDTO = (overrides: Partial<DetallePedidoDTO> = {}): DetallePedidoDTO =>
    ({
        id: 1,
        producto_id: 10,
        producto_sku: 'SKU-010',
        producto_nombre: 'Guantes de nitrilo',
        lote_id: 5,
        lote_codigo: 'LOTE-5',
        cantidad: 3,
        cantidad_preparada: 0,
        precio_unitario_historico: 2000,
        descuento: 0,
        subtotal: 6000,
        observacion: null,
        ...overrides,
    }) as DetallePedidoDTO

const pedidoDTO = (overrides: Partial<PedidoDTO> = {}): PedidoDTO =>
    ({
        id: 100,
        cliente_id: 1,
        cliente_nombre: 'Clínica Andes',
        sucursal_origen_id: 2,
        sucursal_nombre: 'Providencia',
        direccion_entrega_id: 7,
        estado_pedido: 'PENDIENTE',
        tipo_venta: 'WEBPAY',
        tipo_despacho: 'EXPRESS',
        prioridad_medica: 'ALTA',
        fecha_creacion: '2026-06-01T10:00:00Z',
        fecha_actualizacion: '2026-06-01T10:00:00Z',
        fecha_requerida_entrega: null,
        subtotal: 6000,
        descuento_total: 0,
        monto_neto: 6000,
        monto_iva: 1140,
        total: 7140,
        observacion: null,
        detalles: [detalleDTO()],
        ...overrides,
    }) as PedidoDTO

describe('toDetallePedido', () => {
    it('mapea snake_case -> camelCase', () => {
        const d = toDetallePedido(detalleDTO())
        expect(d.productoId).toBe(10)
        expect(d.productoNombre).toBe('Guantes de nitrilo')
        expect(d.precioUnitario).toBe(2000)
        expect(d.subtotal).toBe(6000)
    })

    it('observacion null cae a string vacío', () => {
        const d = toDetallePedido(detalleDTO({ observacion: null }))
        expect(d.observacion).toBe('')
    })
})

describe('toPedido', () => {
    it('mapea los campos principales y desglosa los montos', () => {
        const p = toPedido(pedidoDTO())
        expect(p.id).toBe(100)
        expect(p.cliente).toBe('Clínica Andes')
        expect(p.estado).toBe('PENDIENTE')
        expect(p.montoNeto).toBe(6000)
        expect(p.montoIva).toBe(1140)
        expect(p.total).toBe(7140)
    })

    it('mapea el arreglo de detalles', () => {
        const p = toPedido(pedidoDTO())
        expect(p.detalles).toHaveLength(1)
        expect(p.detalles[0]?.productoSku).toBe('SKU-010')
    })

    it('detalles ausentes -> arreglo vacío (no undefined)', () => {
        const p = toPedido(pedidoDTO({ detalles: undefined as never }))
        expect(p.detalles).toEqual([])
    })

    it('cliente_nombre y observacion ausentes caen a string vacío', () => {
        const p = toPedido(pedidoDTO({ cliente_nombre: null as never, observacion: null }))
        expect(p.cliente).toBe('')
        expect(p.observacion).toBe('')
    })
})
