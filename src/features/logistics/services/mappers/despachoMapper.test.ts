// Ruta destino: src/features/logistics/services/mappers/despachoMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toDespacho, toCotizacion } from './despachoMapper'

describe('toDespacho', () => {
    it('mapea un objeto plano (respuesta directa de PATCH .../estado/)', () => {
        const d = toDespacho({
            id: 1,
            pedido_id: 100,
            courier_nombre: 'Chilexpress',
            numero_seguimiento: 'CX123',
            estado_envio: 'EN_TRANSITO',
            tipo_despacho: 'EXPRESS',
            costo_despacho: 2990,
        })
        expect(d.id).toBe(1)
        expect(d.pedido_id).toBe(100)
        expect(d.courier_nombre).toBe('Chilexpress')
        expect(d.numero_seguimiento).toBe('CX123')
        expect(d.estado_envio).toBe('EN_TRANSITO')
        expect(d.costo_despacho).toBe(2990)
    })

    it('desempaqueta la envoltura { despacho: {...} } de POST /envios/', () => {
        const d = toDespacho({
            despacho: { id: 2, pedido_id: 200, estado: 'PENDIENTE' },
            numero_ot: 'OT-77',
        })
        expect(d.id).toBe(2)
        expect(d.pedido_id).toBe(200)
        // el número de seguimiento se busca en el objeto despacho, no en el nivel raíz de la envoltura
        expect(d.numero_seguimiento).toBe('')
    })

    it('prueba varias claves candidatas (courier vs carrier, tracking_number vs numero_ot)', () => {
        const d = toDespacho({ id: 1, pedido_id: 1, carrier: 'Shippo', tracking_number: 'SH-9' })
        expect(d.courier_nombre).toBe('Shippo')
        expect(d.numero_seguimiento).toBe('SH-9')
    })

    it('un estado_envio desconocido cae a PENDIENTE en vez de romper', () => {
        const d = toDespacho({ id: 1, pedido_id: 1, estado_envio: 'ALGO_RARO' })
        expect(d.estado_envio).toBe('PENDIENTE')
    })

    it('reconoce el estado sin importar mayúsculas/minúsculas', () => {
        const d = toDespacho({ id: 1, pedido_id: 1, estado: 'en_transito' })
        expect(d.estado_envio).toBe('EN_TRANSITO')
    })

    it('parsea montos que vienen como string con símbolos ("$2.990")', () => {
        const d = toDespacho({ id: 1, pedido_id: 1, costo: '$2.990' })
        expect(d.costo_despacho).toBe(2990)
    })

    it('valores faltantes caen a defaults neutros (no rompe la UI)', () => {
        const d = toDespacho({})
        expect(d.courier_nombre).toBe('')
        expect(d.numero_seguimiento).toBe('')
        expect(d.costo_despacho).toBe(0)
        expect(d.url_etiqueta).toBe('')
        expect(d.estado_envio).toBe('PENDIENTE')
    })

    it('tolera un body que no es objeto (null/undefined) sin lanzar', () => {
        expect(() => toDespacho(null)).not.toThrow()
        expect(() => toDespacho(undefined)).not.toThrow()
    })
})

describe('toCotizacion', () => {
    it('mapea servicios_disponibles cuando viene como array', () => {
        const c = toCotizacion({
            origin_county_code: '13101',
            destination_county_code: '13120',
            servicios_disponibles: [{ nombre: 'Express' }],
            pedido_id: 5,
            num_cajas: 2,
        })
        expect(c.servicios_disponibles).toHaveLength(1)
        expect(c.pedido_id).toBe(5)
        expect(c.num_cajas).toBe(2)
    })

    it('si servicios_disponibles no es array, se normaliza a []', () => {
        const c = toCotizacion({ servicios_disponibles: 'no-es-array' })
        expect(c.servicios_disponibles).toEqual([])
    })

    it('pedido_id ausente se mapea a null, no a 0', () => {
        const c = toCotizacion({})
        expect(c.pedido_id).toBeNull()
    })
})
