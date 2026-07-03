// Ruta destino: src/features/logistics/services/colaPrioridad.test.ts
import { describe, it, expect } from 'vitest'
import { ordenarColaLogistica } from './colaPrioridad'
import type { Pedido } from '@/types/models'

const p = (overrides: Partial<Pedido>): Pedido =>
    ({
        id: 0,
        prioridad: 'NORMAL',
        tipoDespacho: 'NORMAL',
        fechaCreacion: '2026-06-01T00:00:00Z',
        ...overrides,
    }) as Pedido

describe('ordenarColaLogistica', () => {
    it('ordena primero por prioridad médica: CRITICA -> ALTA -> NORMAL', () => {
        const pedidos = [
            p({ id: 1, prioridad: 'NORMAL' as never }),
            p({ id: 2, prioridad: 'CRITICA' as never }),
            p({ id: 3, prioridad: 'ALTA' as never }),
        ]
        const out = ordenarColaLogistica(pedidos).map((x) => x.id)
        expect(out).toEqual([2, 3, 1])
    })

    it('en empate de prioridad, EXPRESS va antes que NORMAL', () => {
        const pedidos = [
            p({ id: 1, prioridad: 'ALTA' as never, tipoDespacho: 'NORMAL' as never }),
            p({ id: 2, prioridad: 'ALTA' as never, tipoDespacho: 'EXPRESS' as never }),
        ]
        const out = ordenarColaLogistica(pedidos).map((x) => x.id)
        expect(out).toEqual([2, 1])
    })

    it('en empate de prioridad y despacho, gana el más antiguo (FIFO)', () => {
        const pedidos = [
            p({ id: 1, fechaCreacion: '2026-06-02T00:00:00Z' }),
            p({ id: 2, fechaCreacion: '2026-06-01T00:00:00Z' }),
        ]
        const out = ordenarColaLogistica(pedidos).map((x) => x.id)
        expect(out).toEqual([2, 1])
    })

    it('no muta el arreglo original', () => {
        const pedidos = [p({ id: 1, prioridad: 'NORMAL' as never }), p({ id: 2, prioridad: 'CRITICA' as never })]
        const original = [...pedidos]
        ordenarColaLogistica(pedidos)
        expect(pedidos).toEqual(original)
    })

    it('caso combinado: prioridad manda sobre despacho y fecha', () => {
        const pedidos = [
            p({ id: 1, prioridad: 'NORMAL' as never, tipoDespacho: 'EXPRESS' as never, fechaCreacion: '2026-05-01T00:00:00Z' }),
            p({ id: 2, prioridad: 'CRITICA' as never, tipoDespacho: 'NORMAL' as never, fechaCreacion: '2026-06-10T00:00:00Z' }),
        ]
        const out = ordenarColaLogistica(pedidos).map((x) => x.id)
        // el pedido 2 es CRITICA (más urgente) aunque sea más nuevo y no EXPRESS
        expect(out).toEqual([2, 1])
    })
})
