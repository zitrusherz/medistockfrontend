// Ruta destino: src/features/integrations/services/mappers/apiClientMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toApiClient } from './apiClientMapper'
import type { ApiClient } from '../../types'

const dto = (overrides: Partial<ApiClient> = {}): ApiClient =>
    ({
        id: 1,
        institucion: 'Clínica Andes',
        institucion_id: 5,
        nombre_cliente_api: 'ERP Clínica Andes',
        activo: true,
        limite_requests_diario: 1000,
        fecha_creacion: '2026-01-01',
        fecha_expiracion: '2027-01-01',
        vencida: false,
        ...overrides,
    }) as ApiClient

describe('toApiClient', () => {
    it('estado ACTIVA cuando activo=true y no está vencida', () => {
        expect(toApiClient(dto()).estado).toBe('ACTIVA')
    })

    it('estado REVOCADA cuando activo=false, sin importar vencida', () => {
        expect(toApiClient(dto({ activo: false, vencida: false })).estado).toBe('REVOCADA')
        expect(toApiClient(dto({ activo: false, vencida: true })).estado).toBe('REVOCADA')
    })

    it('estado VENCIDA cuando activo=true pero vencida=true', () => {
        expect(toApiClient(dto({ activo: true, vencida: true })).estado).toBe('VENCIDA')
    })

    it('institucion y nombre caen a "—" cuando faltan', () => {
        const c = toApiClient(dto({ institucion: undefined as never, nombre_cliente_api: undefined as never }))
        expect(c.institucion).toBe('—')
        expect(c.nombre).toBe('—')
    })

    it('limiteRequestsDiario se coacciona a número, default 0', () => {
        expect(toApiClient(dto({ limite_requests_diario: undefined as never })).limiteRequestsDiario).toBe(0)
        expect(toApiClient(dto({ limite_requests_diario: '500' as never })).limiteRequestsDiario).toBe(500)
    })

    it('institucionId es null cuando no viene', () => {
        expect(toApiClient(dto({ institucion_id: undefined as never })).institucionId).toBeNull()
    })
})
