// Ruta destino: src/features/accounts/services/mappers/workerMapper.test.ts
import { describe, it, expect, vi } from 'vitest'

// No tenemos '../../roles' (la lógica que traduce grupos de Django a Rol).
// Se mockea para que el test de este mapper no dependa de esa implementación;
// si más adelante quieres que grupoToRol() se pruebe con datos reales, pásame
// features/accounts/roles.ts y agrego un test dedicado para esa función.
// vi.mock() se hoistea por encima -> vi.hoisted() evita "Cannot access before initialization".
const { grupoToRol } = vi.hoisted(() => ({ grupoToRol: vi.fn(() => 'EJECUTIVO') }))
vi.mock('../../roles', () => ({ grupoToRol }))

import { toTrabajador } from './workerMapper'
import type { Trabajador } from '../../types'

const dto = (overrides: Partial<Trabajador> = {}): Trabajador =>
    ({
        id: 1,
        rut: null,
        telefono: '912345678',
        cargo: 'Ejecutivo de cuentas',
        sucursal: 1,
        activo: true,
        usuario: {
            first_name: 'Carlos',
            last_name: 'Soto',
            username: 'csoto',
            email: 'csoto@medistock.cl',
            grupos: ['Ejecutivos'],
            date_joined: '2026-01-10',
            is_active: true,
            rut: '11.111.111-1',
        },
        ...overrides,
    }) as Trabajador

describe('toTrabajador', () => {
    it('arma el nombre completo desde first_name + last_name', () => {
        const t = toTrabajador(dto())
        expect(t.nombre).toBe('Carlos Soto')
    })

    it('si no hay nombre/apellido, cae a username y luego a email', () => {
        const sinNombre = toTrabajador(
            dto({
                usuario: {
                    ...dto().usuario,
                    first_name: '',
                    last_name: '',
                    username: 'csoto',
                } as never,
            }),
        )
        expect(sinNombre.nombre).toBe('csoto')
    })

    it('el rut del trabajador manda sobre el rut del usuario', () => {
        const t = toTrabajador(dto({ rut: '22.222.222-2' }))
        expect(t.rut).toBe('22.222.222-2')
    })

    it('si el trabajador no tiene rut propio, usa el del usuario', () => {
        const t = toTrabajador(dto({ rut: null }))
        expect(t.rut).toBe('11.111.111-1')
    })

    it('deriva el rol a partir de los grupos del usuario (grupoToRol)', () => {
        const t = toTrabajador(dto())
        expect(grupoToRol).toHaveBeenCalledWith(['Ejecutivos'])
        expect(t.rol).toBe('EJECUTIVO')
    })

    it('activo del trabajador manda; si no viene, cae a is_active del usuario', () => {
        const t = toTrabajador(dto({ activo: undefined as never }))
        expect(t.activo).toBe(true) // usuario.is_active
    })

    it('sucursalId es null cuando el trabajador no tiene sucursal asignada', () => {
        const t = toTrabajador(dto({ sucursal: null as never }))
        expect(t.sucursalId).toBeNull()
    })
})
