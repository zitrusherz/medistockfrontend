// Ruta destino: src/features/payments/services/paymentState.test.ts
import { describe, it, expect } from 'vitest'
import {
    resultadoDesdeEstado,
    resultadoDesdeCommit,
    RESULTADO_CONFIG,
    permiteReintento,
} from './paymentState'
import type { CommitResult } from './strategies/PaymentStrategy'

describe('resultadoDesdeEstado', () => {
    it('traduce cada estado_pago conocido del backend', () => {
        expect(resultadoDesdeEstado('CONFIRMADO')).toBe('aprobado')
        expect(resultadoDesdeEstado('RECHAZADO')).toBe('rechazado')
        expect(resultadoDesdeEstado('ANULADO')).toBe('anulado')
        expect(resultadoDesdeEstado('ERROR')).toBe('error')
        expect(resultadoDesdeEstado('INICIADO')).toBe('pendiente')
    })

    it('un estado desconocido cae a "pendiente" en vez de romper', () => {
        expect(resultadoDesdeEstado('ALGO_NUEVO_DEL_BACKEND')).toBe('pendiente')
    })
})

describe('resultadoDesdeCommit', () => {
    it('si aprobada=true, el resultado es "aprobado" sin mirar el estado', () => {
        const commit = { aprobada: true, estadoPago: 'ERROR' } as CommitResult
        expect(resultadoDesdeCommit(commit)).toBe('aprobado')
    })

    it('si aprobada=false, el estado_pago precisa el motivo', () => {
        const commit = { aprobada: false, estadoPago: 'RECHAZADO' } as CommitResult
        expect(resultadoDesdeCommit(commit)).toBe('rechazado')
    })
})

describe('RESULTADO_CONFIG', () => {
    it('define copy y tono para los 5 resultados posibles', () => {
        const claves = ['aprobado', 'rechazado', 'anulado', 'error', 'pendiente'] as const
        for (const k of claves) {
            expect(RESULTADO_CONFIG[k].titulo).toBeTruthy()
            expect(RESULTADO_CONFIG[k].mensaje).toBeTruthy()
            expect(RESULTADO_CONFIG[k].tone).toBeTruthy()
        }
    })
})

describe('permiteReintento', () => {
    it('permite reintentar cuando rechazado, anulado o error', () => {
        expect(permiteReintento('rechazado')).toBe(true)
        expect(permiteReintento('anulado')).toBe(true)
        expect(permiteReintento('error')).toBe(true)
    })

    it('no permite reintentar si aprobado o pendiente', () => {
        expect(permiteReintento('aprobado')).toBe(false)
        expect(permiteReintento('pendiente')).toBe(false)
    })
})
