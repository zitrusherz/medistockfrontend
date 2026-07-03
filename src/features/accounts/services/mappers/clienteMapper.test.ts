// Ruta destino: src/features/accounts/services/mappers/clienteMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toCliente } from './clienteMapper'
import type { ClienteDTO } from '../../types/cliente'

const dto = (overrides: Partial<ClienteDTO> = {}): ClienteDTO =>
    ({
        id: 1,
        tipo_cliente: 'B2C',
        email: 'paciente@correo.cl',
        ...overrides,
    }) as ClienteDTO

describe('toCliente', () => {
    it('usa razon_social como nombre cuando el cliente es una institución', () => {
        const c = toCliente(dto({ razon_social: 'Clínica Andes SpA' }))
        expect(c.nombre).toBe('Clínica Andes SpA')
    })

    it('si no hay razon_social, arma el nombre desde nombre + apellido', () => {
        const c = toCliente(dto({ nombre: 'Ana', apellido: 'Pérez' }))
        expect(c.nombre).toBe('Ana Pérez')
    })

    it('si no hay ni razon_social ni nombre/apellido, cae al email', () => {
        const c = toCliente(dto({ email: 'paciente@correo.cl' }))
        expect(c.nombre).toBe('paciente@correo.cl')
    })

    it('como último recurso, arma "Cliente {id}"', () => {
        const c = toCliente(dto({ email: undefined as never, id: 42 }))
        expect(c.nombre).toBe('Cliente 42')
    })

    it('prefiere rut_empresa sobre rut cuando ambos existen', () => {
        const c = toCliente(dto({ rut_empresa: '76.123.456-7', rut: '11.111.111-1' }))
        expect(c.rut).toBe('76.123.456-7')
    })

    it('usa rut cuando no hay rut_empresa', () => {
        const c = toCliente(dto({ rut: '11.111.111-1' }))
        expect(c.rut).toBe('11.111.111-1')
    })

    it('valores opcionales ausentes caen a defaults seguros', () => {
        const c = toCliente(dto({ telefono: undefined as never, cupo_credito: undefined as never }))
        expect(c.telefono).toBe('')
        expect(c.cupoCredito).toBeNull()
        expect(c.activo).toBe(true) // default cuando el backend no manda el campo
    })

    it('fechaRegistro cae a date_joined si no viene fecha_registro', () => {
        const c = toCliente(dto({ fecha_registro: undefined as never, date_joined: '2026-01-15' }))
        expect(c.fechaRegistro).toBe('2026-01-15')
    })
})
