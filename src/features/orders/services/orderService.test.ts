// Ruta destino: src/features/orders/services/orderService.test.ts
import { describe, it, expect, vi } from 'vitest'

// orderService.ts importa `api` desde '@/lib/axios' a nivel de módulo (para
// crearPedido, misPedidos, etc., que sí hacen red). Lo que probamos aquí es
// SOLO la máquina de estados (puedePasar / transicionesValidas), que es lógica
// pura y no toca la red — por eso mockeamos axios en vez de pedir ese archivo:
// así el import no falla y el test queda aislado de la capa HTTP.
vi.mock('@/lib/axios', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

import { transicionesValidas, puedePasar, esEstadoTerminal } from './orderService'
import type { EstadoPedido } from '../types'

describe('transicionesValidas', () => {
    it('PENDIENTE puede pasar a APROBADO, RECHAZADO o CANCELADO', () => {
        expect(transicionesValidas('PENDIENTE' as EstadoPedido)).toEqual([
            'APROBADO',
            'RECHAZADO',
            'CANCELADO',
        ])
    })

    it('los estados terminales no tienen transiciones', () => {
        expect(transicionesValidas('ENTREGADO' as EstadoPedido)).toEqual([])
        expect(transicionesValidas('RECHAZADO' as EstadoPedido)).toEqual([])
        expect(transicionesValidas('CANCELADO' as EstadoPedido)).toEqual([])
    })
})

describe('puedePasar', () => {
    it('permite el camino feliz completo: PENDIENTE -> ... -> ENTREGADO', () => {
        expect(puedePasar('PENDIENTE' as EstadoPedido, 'APROBADO' as EstadoPedido)).toBe(true)
        expect(puedePasar('APROBADO' as EstadoPedido, 'EN_PICKING' as EstadoPedido)).toBe(true)
        expect(puedePasar('EN_PICKING' as EstadoPedido, 'DESPACHADO' as EstadoPedido)).toBe(true)
        expect(puedePasar('DESPACHADO' as EstadoPedido, 'ENTREGADO' as EstadoPedido)).toBe(true)
    })

    it('no permite saltarse pasos (PENDIENTE -> ENTREGADO directo)', () => {
        expect(puedePasar('PENDIENTE' as EstadoPedido, 'ENTREGADO' as EstadoPedido)).toBe(false)
    })

    it('no permite mover un pedido ya en estado terminal', () => {
        expect(puedePasar('ENTREGADO' as EstadoPedido, 'CANCELADO' as EstadoPedido)).toBe(false)
    })

    it('CANCELADO es posible desde varios estados intermedios, no desde DESPACHADO', () => {
        expect(puedePasar('PENDIENTE' as EstadoPedido, 'CANCELADO' as EstadoPedido)).toBe(true)
        expect(puedePasar('APROBADO' as EstadoPedido, 'CANCELADO' as EstadoPedido)).toBe(true)
        expect(puedePasar('DESPACHADO' as EstadoPedido, 'CANCELADO' as EstadoPedido)).toBe(false)
    })
})

describe('esEstadoTerminal', () => {
    it('true para ENTREGADO, RECHAZADO, CANCELADO', () => {
        expect(esEstadoTerminal('ENTREGADO' as EstadoPedido)).toBe(true)
        expect(esEstadoTerminal('RECHAZADO' as EstadoPedido)).toBe(true)
        expect(esEstadoTerminal('CANCELADO' as EstadoPedido)).toBe(true)
    })

    it('false para estados con transiciones pendientes', () => {
        expect(esEstadoTerminal('PENDIENTE' as EstadoPedido)).toBe(false)
        expect(esEstadoTerminal('APROBADO' as EstadoPedido)).toBe(false)
        expect(esEstadoTerminal('EN_PICKING' as EstadoPedido)).toBe(false)
        expect(esEstadoTerminal('DESPACHADO' as EstadoPedido)).toBe(false)
    })
})
