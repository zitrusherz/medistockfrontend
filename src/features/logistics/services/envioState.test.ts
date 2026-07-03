// Ruta destino: src/features/logistics/services/envioState.test.ts
import { describe, it, expect } from 'vitest'
import {
    PASOS_ENVIO,
    estadoEnvioConfig,
    indicePaso,
    esRamaExcepcion,
    esTerminal,
    esEnTransito,
} from './envioState'
import type { EstadoEnvio } from '@/types/models'

describe('estadoEnvioConfig', () => {
    it('devuelve label/descripcion/tone para cada estado válido', () => {
        const estados: EstadoEnvio[] = [
            'PENDIENTE',
            'RETIRADO',
            'EN_TRANSITO',
            'ENTREGADO',
            'DEVUELTO',
            'CANCELADO',
        ]
        for (const e of estados) {
            const cfg = estadoEnvioConfig(e)
            expect(cfg.label).toBeTruthy()
            expect(cfg.descripcion).toBeTruthy()
            expect(cfg.tone).toBeTruthy()
        }
    })

    it('un estado no reconocido cae a la config de PENDIENTE, no rompe el render', () => {
        const cfg = estadoEnvioConfig('ESTADO_INVENTADO' as EstadoEnvio)
        expect(cfg.label).toBe('Pendiente de retiro')
    })

    it('ENTREGADO tiene tono success y DEVUELTO/CANCELADO tono danger', () => {
        expect(estadoEnvioConfig('ENTREGADO').tone).toBe('success')
        expect(estadoEnvioConfig('DEVUELTO').tone).toBe('danger')
        expect(estadoEnvioConfig('CANCELADO').tone).toBe('danger')
    })
})

describe('indicePaso', () => {
    it('devuelve la posición dentro de la barra lineal de progreso', () => {
        expect(indicePaso('PENDIENTE')).toBe(0)
        expect(indicePaso('RETIRADO')).toBe(1)
        expect(indicePaso('EN_TRANSITO')).toBe(2)
        expect(indicePaso('ENTREGADO')).toBe(3)
    })

    it('devuelve -1 para las ramas de excepción (no están en la barra)', () => {
        expect(indicePaso('DEVUELTO')).toBe(-1)
        expect(indicePaso('CANCELADO')).toBe(-1)
    })
})

describe('esRamaExcepcion / esTerminal', () => {
    it('DEVUELTO y CANCELADO son rama de excepción y terminales', () => {
        expect(esRamaExcepcion('DEVUELTO')).toBe(true)
        expect(esRamaExcepcion('CANCELADO')).toBe(true)
        expect(esTerminal('DEVUELTO')).toBe(true)
        expect(esTerminal('CANCELADO')).toBe(true)
    })

    it('ENTREGADO es terminal pero NO rama de excepción', () => {
        expect(esTerminal('ENTREGADO')).toBe(true)
        expect(esRamaExcepcion('ENTREGADO')).toBe(false)
    })

    it('PENDIENTE, RETIRADO y EN_TRANSITO no son terminales ni excepción', () => {
        for (const e of ['PENDIENTE', 'RETIRADO', 'EN_TRANSITO'] as EstadoEnvio[]) {
            expect(esTerminal(e)).toBe(false)
            expect(esRamaExcepcion(e)).toBe(false)
        }
    })
})

describe('esEnTransito', () => {
    it('true solo cuando el estado es EN_TRANSITO', () => {
        expect(esEnTransito('EN_TRANSITO')).toBe(true)
        expect(esEnTransito('PENDIENTE')).toBe(false)
        expect(esEnTransito(null)).toBe(false)
        expect(esEnTransito(undefined)).toBe(false)
    })
})

describe('PASOS_ENVIO', () => {
    it('define el orden canónico de la barra de progreso', () => {
        expect(PASOS_ENVIO).toEqual(['PENDIENTE', 'RETIRADO', 'EN_TRANSITO', 'ENTREGADO'])
    })
})
