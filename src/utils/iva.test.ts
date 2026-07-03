// Ruta destino: src/utils/iva.test.ts
import { describe, it, expect } from 'vitest'
import { calcularDiferencia, calcularIVA, calcTotales, desgloseIVA } from './iva'
import type { CartItem } from '@/features/cart/types'

describe('calcularDiferencia', () => {
    it('devuelve la diferencia entre el monto con IVA y el neto', () => {
        expect(calcularDiferencia(1000, 1190)).toBe(190)
    })
})

describe('calcularIVA', () => {
    it('calcula el 19% de un monto', () => {
        expect(calcularIVA(1000)).toBeCloseTo(190, 5)
    })

    it('el 19% de 0 es 0', () => {
        expect(calcularIVA(0)).toBe(0)
    })
})

describe('calcTotales', () => {
    it('suma neto/iva/total de una lista de items del carrito', () => {
        const items = [
            { priceNeto: 1000, priceIva: 1190, quantity: 2 },
            { priceNeto: 500, priceIva: 595, quantity: 1 },
        ] as CartItem[]

        const totales = calcTotales(items)

        expect(totales.neto).toBe(2500) // 1000*2 + 500*1
        expect(totales.total).toBe(2975) // 1190*2 + 595*1
        expect(totales.iva).toBe(475) // 2975 - 2500
    })

    it('devuelve todo en 0 con carrito vacío', () => {
        expect(calcTotales([])).toEqual({ neto: 0, iva: 0, total: 0 })
    })
})

describe('desgloseIVA', () => {
    it('desglosa un monto neto en {neto, iva, total}', () => {
        expect(desgloseIVA(100)).toEqual({ neto: 100, iva: 19, total: 119 })
    })

    it('redondea el IVA a entero (CLP sin decimales)', () => {
        // 50 * 0.19 = 9.5 -> Math.round redondea hacia arriba (banker's rounding no aplica en JS)
        const r = desgloseIVA(50)
        expect(r.iva).toBe(10)
        expect(r.total).toBe(60)
    })

    it('con neto 0 devuelve todo en 0', () => {
        expect(desgloseIVA(0)).toEqual({ neto: 0, iva: 0, total: 0 })
    })
})
