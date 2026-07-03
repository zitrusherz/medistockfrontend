// Ruta destino: src/features/inventory/services/fefo.test.ts
import { describe, it, expect } from 'vitest'
import { lotesFEFO, sugerirFEFO } from './fefo'
import type { Lote } from '../types'

const lote = (overrides: Partial<Lote>): Lote =>
    ({
        id: 0,
        activo: true,
        fecha_vencimiento: '2026-12-31',
        producto: { id: 1 },
        ...overrides,
    }) as Lote

describe('lotesFEFO', () => {
    it('ordena los lotes de un producto por fecha de vencimiento ascendente', () => {
        const lotes = [
            lote({ id: 1, fecha_vencimiento: '2026-12-31', producto: { id: 1 } as never }),
            lote({ id: 2, fecha_vencimiento: '2026-08-15', producto: { id: 1 } as never }),
            lote({ id: 3, fecha_vencimiento: '2026-10-01', producto: { id: 1 } as never }),
        ]
        const out = lotesFEFO(lotes, 1).map((l) => l.id)
        expect(out).toEqual([2, 3, 1])
    })

    it('filtra solo los lotes del producto solicitado', () => {
        const lotes = [
            lote({ id: 1, producto: { id: 1 } as never }),
            lote({ id: 2, producto: { id: 2 } as never }),
        ]
        expect(lotesFEFO(lotes, 1).map((l) => l.id)).toEqual([1])
    })

    it('excluye lotes inactivos', () => {
        const lotes = [
            lote({ id: 1, activo: true, producto: { id: 1 } as never }),
            lote({ id: 2, activo: false, producto: { id: 1 } as never }),
        ]
        expect(lotesFEFO(lotes, 1).map((l) => l.id)).toEqual([1])
    })

    it('acepta el productoId como number o string indistintamente', () => {
        const lotes = [lote({ id: 1, producto: { id: 7 } as never })]
        expect(lotesFEFO(lotes, '7').map((l) => l.id)).toEqual([1])
        expect(lotesFEFO(lotes, 7).map((l) => l.id)).toEqual([1])
    })
})

describe('sugerirFEFO', () => {
    it('devuelve el primer lote por vencer', () => {
        const lotes = [
            lote({ id: 1, fecha_vencimiento: '2026-12-31', producto: { id: 1 } as never }),
            lote({ id: 2, fecha_vencimiento: '2026-08-15', producto: { id: 1 } as never }),
        ]
        expect(sugerirFEFO(lotes, 1)?.id).toBe(2)
    })

    it('devuelve null si no hay lotes activos para ese producto', () => {
        expect(sugerirFEFO([], 1)).toBeNull()
    })
})
