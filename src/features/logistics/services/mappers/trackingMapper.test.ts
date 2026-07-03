// Ruta destino: src/features/logistics/services/mappers/trackingMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toEnvioTracking } from './trackingMapper'

describe('toEnvioTracking', () => {
    it('lee la envoltura { data: {...} } del endpoint de tracking', () => {
        const t = toEnvioTracking({
            data: {
                estado_envio: 'EN_TRANSITO',
                numero_seguimiento: 'CX123',
                courier: 'Chilexpress',
                tracking: [{ estado: 'RETIRADO', descripcion: 'Retirado en bodega' }],
            },
        })
        expect(t.estadoEnvio).toBe('EN_TRANSITO')
        expect(t.numeroSeguimiento).toBe('CX123')
        expect(t.courierNombre).toBe('Chilexpress')
        expect(t.eventos).toHaveLength(1)
        expect(t.eventos[0]?.descripcion).toBe('Retirado en bodega')
    })

    it('también acepta el objeto data plano, sin envoltura', () => {
        const t = toEnvioTracking({ estado_envio: 'PENDIENTE', tracking: [] })
        expect(t.estadoEnvio).toBe('PENDIENTE')
        expect(t.eventos).toEqual([])
    })

    it('si tracking no es array, se normaliza a []', () => {
        const t = toEnvioTracking({ tracking: 'no-es-array' })
        expect(t.eventos).toEqual([])
    })

    it('si no viene estado_envio explícito, lo infiere del último evento reconocible', () => {
        const t = toEnvioTracking({
            tracking: [
                { status: 'RETIRADO', date: '2026-06-01' },
                { status: 'EN_TRANSITO', date: '2026-06-02' },
            ],
        })
        expect(t.estadoEnvio).toBe('EN_TRANSITO')
    })

    it('si ningún evento tiene un estado reconocible, estadoEnvio queda null', () => {
        const t = toEnvioTracking({ tracking: [{ mensaje: 'algo pasó, sin estado claro' }] })
        expect(t.estadoEnvio).toBeNull()
    })

    it('normaliza cada evento probando varias claves candidatas', () => {
        const t = toEnvioTracking({
            tracking: [
                {
                    state: 'ENTREGADO',
                    message: 'Entregado al destinatario',
                    timestamp: '2026-06-03T12:00:00Z',
                    location: 'Providencia',
                },
            ],
        })
        expect(t.eventos[0]).toEqual({
            estado: 'ENTREGADO',
            descripcion: 'Entregado al destinatario',
            fecha: '2026-06-03T12:00:00Z',
            ubicacion: 'Providencia',
        })
    })

    it('tolera un body vacío o no-objeto sin lanzar', () => {
        expect(() => toEnvioTracking(null)).not.toThrow()
        expect(toEnvioTracking({}).eventos).toEqual([])
    })
})
