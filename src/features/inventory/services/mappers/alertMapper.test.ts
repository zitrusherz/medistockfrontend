// Ruta destino: src/features/inventory/services/mappers/alertMapper.test.ts
import { describe, it, expect } from 'vitest'
import { diasHasta, toAlertaStock, toAlertaVencimiento } from './alertMapper'
import type { Inventario, Lote } from '../../types'

/** Fecha ISO "YYYY-MM-DD" a N días desde hoy (positivo = futuro). Determinista
 *  sin necesitar fake timers, porque diasHasta también calcula contra "hoy". */
const fechaEnDias = (n: number): string => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
}

describe('diasHasta', () => {
    it('calcula días positivos hacia una fecha futura', () => {
        expect(diasHasta(fechaEnDias(10))).toBe(10)
    })

    it('calcula días negativos para una fecha ya vencida', () => {
        expect(diasHasta(fechaEnDias(-5))).toBe(-5)
    })

    it('hoy mismo es 0', () => {
        expect(diasHasta(fechaEnDias(0))).toBe(0)
    })

    it('una fecha no parseable devuelve NaN', () => {
        expect(Number.isNaN(diasHasta('fecha-invalida'))).toBe(true)
        expect(Number.isNaN(diasHasta(''))).toBe(true)
    })
})

describe('toAlertaStock', () => {
    const base = (overrides: Partial<Inventario> = {}): Inventario =>
        ({
            id: 1,
            stock_neto: 2,
            stock_critico: 5,
            sucursal: 1,
            sucursal_nombre: 'Providencia',
            alerta_stock_critico: false,
            lote: {
                producto: { nombre: 'Guantes de nitrilo', sku: 'SKU-1' },
                codigo_lote: 'LOTE-1',
            },
            ...overrides,
        }) as Inventario

    it('calcula el faltante como minimo - stock (nunca negativo)', () => {
        const a = toAlertaStock(base({ stock_neto: 2, stock_critico: 5 }))
        expect(a.faltante).toBe(3)
    })

    it('faltante es 0 cuando el stock ya supera el mínimo', () => {
        const a = toAlertaStock(base({ stock_neto: 8, stock_critico: 5 }))
        expect(a.faltante).toBe(0)
    })

    it('agotado es true solo cuando el stock es exactamente 0', () => {
        expect(toAlertaStock(base({ stock_neto: 0 })).agotado).toBe(true)
        expect(toAlertaStock(base({ stock_neto: 1 })).agotado).toBe(false)
    })

    it('critico confía en la bandera del backend si viene en true', () => {
        const a = toAlertaStock(base({ stock_neto: 100, stock_critico: 5, alerta_stock_critico: true }))
        expect(a.critico).toBe(true)
    })

    it('critico también se deriva si stock <= minimo aunque la bandera venga en false', () => {
        const a = toAlertaStock(base({ stock_neto: 3, stock_critico: 5, alerta_stock_critico: false }))
        expect(a.critico).toBe(true)
    })
})

describe('toAlertaVencimiento', () => {
    const base = (overrides: Partial<Lote> = {}): Lote =>
        ({
            id: 1,
            producto: { nombre: 'Guantes de nitrilo', sku: 'SKU-1', marca_nombre: 'MedBrand' },
            codigo_lote: 'LOTE-1',
            fecha_vencimiento: fechaEnDias(5),
            dias_para_vencer: 5,
            ...overrides,
        }) as Lote

    it('vencido=true cuando diasParaVencer es negativo', () => {
        const a = toAlertaVencimiento(base({ fecha_vencimiento: fechaEnDias(-3), dias_para_vencer: -3 }))
        expect(a.vencido).toBe(true)
    })

    it('critico cuando faltan 10 días o menos', () => {
        const a = toAlertaVencimiento(base({ fecha_vencimiento: fechaEnDias(10), dias_para_vencer: 10 }))
        expect(a.critico).toBe(true)
        expect(a.advertencia).toBe(false)
    })

    it('advertencia cuando faltan entre 11 y 25 días', () => {
        const a = toAlertaVencimiento(base({ fecha_vencimiento: fechaEnDias(20), dias_para_vencer: 20 }))
        expect(a.advertencia).toBe(true)
        expect(a.critico).toBe(false)
    })

    it('ni critico ni advertencia cuando faltan más de 25 días', () => {
        const a = toAlertaVencimiento(base({ fecha_vencimiento: fechaEnDias(40), dias_para_vencer: 40 }))
        expect(a.critico).toBe(false)
        expect(a.advertencia).toBe(false)
    })

    it('si la fecha no es parseable, cae al dias_para_vencer que manda el backend', () => {
        const a = toAlertaVencimiento(base({ fecha_vencimiento: 'invalida', dias_para_vencer: 7 }))
        expect(a.diasParaVencer).toBe(7)
    })
})
