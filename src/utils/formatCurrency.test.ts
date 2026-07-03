// Ruta destino: src/utils/formatCurrency.test.ts
import { describe, it, expect } from 'vitest'
import { formatCLP } from './formatCurrency'


const soloDigitos = (s: string) => s.replace(/\D/g, '')

describe('formatCLP', () => {
    it('formatea un monto entero sin decimales', () => {
        expect(soloDigitos(formatCLP(15000))).toBe('15000')
    })

    it('redondea/trunca cualquier decimal (CLP no usa centavos)', () => {
        // maximumFractionDigits: 0 -> Intl redondea internamente
        expect(soloDigitos(formatCLP(1500.7))).toBe('1501')
    })

    it('formatea el cero', () => {
        expect(soloDigitos(formatCLP(0))).toBe('0')
    })

    it('formatea montos negativos conservando el signo', () => {
        const out = formatCLP(-500)
        expect(out).toMatch(/-/)
        expect(soloDigitos(out)).toBe('500')
    })

    it('devuelve "$0" para valores no finitos (NaN, Infinity)', () => {
        expect(formatCLP(NaN)).toBe('$0')
        expect(formatCLP(Infinity)).toBe('$0')
        expect(formatCLP(-Infinity)).toBe('$0')
    })

    it('incluye el símbolo de peso', () => {
        expect(formatCLP(1000)).toContain('$')
    })
})
