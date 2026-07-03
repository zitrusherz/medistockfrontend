// Ruta destino: src/features/accounts/services/mappers/clienteMapper.test.ts
import { describe, it, expect } from 'vitest'
import { toCliente } from './clienteMapper'
import type { ClienteDTO } from '../../types/cliente'

const usuarioBase: ClienteDTO['usuario'] = {
    id: 1,
    username: 'paciente@correo.cl',
    email: 'paciente@correo.cl',
    first_name: '',
    last_name: '',
    rut: '11.111.111-1',
    grupos: [],
    is_active: true,
    is_staff: false,
    date_joined: '2026-01-01',
}

const institucionBase: NonNullable<ClienteDTO['institucion']> = {
    id: 10,
    razon_social: 'Clínica Andes SpA',
    rut_empresa: '76.123.456-7',
    tipo_institucion: null,
}

const direccionBase: ClienteDTO['direcciones'][number] = {
    id: 1,
    direccion: 'Av. Siempre Viva',
    num_direccion: '123',
    detalle_direccion: '',
    comuna: 1,
    comuna_detalle: {
        id: 1,
        nombre: 'Santiago',
    },
    region: {
        id: 1,
        nombre: 'Metropolitana',
    },
    referencia: '',
    nombre_receptor: '',
    telefono_receptor: '',
    es_principal: true,
}

const dto = (overrides: Partial<ClienteDTO> = {}): ClienteDTO => ({
    id: 1,
    usuario: usuarioBase,
    tipo_cliente: 'PARTICULAR',
    rut: '11.111.111-1',
    pasaporte: null,
    telefono: '',
    institucion: null,
    direcciones: [direccionBase],
    activo: true,
    ...overrides,
})

describe('toCliente', () => {
    it('usa razon_social como nombre cuando el cliente es una institución', () => {
        const c = toCliente(
            dto({
                tipo_cliente: 'INSTITUCIONAL',
                institucion: institucionBase,
            }),
        )

        expect(c.nombre).toBe('Clínica Andes SpA')
    })

    it('si no hay razon_social, arma el nombre desde first_name + last_name del usuario', () => {
        const c = toCliente(
            dto({
                usuario: {
                    ...usuarioBase,
                    first_name: 'Ana',
                    last_name: 'Pérez',
                    email: 'ana@correo.cl',
                    username: 'ana@correo.cl',
                },
            }),
        )

        expect(c.nombre).toBe('Ana Pérez')
    })

    it('si no hay razon_social ni nombre/apellido, cae al email del usuario', () => {
        const c = toCliente(
            dto({
                usuario: {
                    ...usuarioBase,
                    first_name: '',
                    last_name: '',
                    email: 'paciente@correo.cl',
                    username: 'paciente_username',
                },
            }),
        )

        expect(c.nombre).toBe('paciente@correo.cl')
    })

    it('si no hay email, cae al username del usuario', () => {
        const c = toCliente(
            dto({
                usuario: {
                    ...usuarioBase,
                    first_name: '',
                    last_name: '',
                    email: '',
                    username: 'paciente_username',
                },
            }),
        )

        expect(c.nombre).toBe('paciente_username')
    })

    it('como último recurso, arma "Cliente {id}"', () => {
        const c = toCliente(
            dto({
                id: 42,
                usuario: {
                    ...usuarioBase,
                    first_name: '',
                    last_name: '',
                    email: '',
                    username: '',
                },
            }),
        )

        expect(c.nombre).toBe('Cliente 42')
    })

    it('usa rut del cliente según el contrato actual del mapper', () => {
        const c = toCliente(
            dto({
                tipo_cliente: 'INSTITUCIONAL',
                rut: '11.111.111-1',
                institucion: {
                    ...institucionBase,
                    rut_empresa: '76.123.456-7',
                },
            }),
        )

        expect(c.rut).toBe('11.111.111-1')
    })

    it('usa rut_empresa de la institución si el cliente no trae rut', () => {
        const c = toCliente(
            dto({
                tipo_cliente: 'INSTITUCIONAL',
                rut: undefined as unknown as string,
                institucion: {
                    ...institucionBase,
                    rut_empresa: '76.123.456-7',
                },
            }),
        )

        expect(c.rut).toBe('76.123.456-7')
    })

    it('valores opcionales ausentes caen a defaults seguros', () => {
        const c = toCliente(
            dto({
                telefono: null as unknown as string,
                cupo_credito: undefined,
                credito_utilizado: undefined,
                activo: undefined as unknown as boolean,
            }),
        )

        expect(c.telefono).toBe('')
        expect(c.cupoCredito).toBeNull()
        expect(c.creditoUsado).toBeNull()
        expect(c.activo).toBe(true)
    })

    it('fechaRegistro usa fecha_registro si viene en el DTO', () => {
        const c = toCliente(
            dto({
                fecha_registro: '2026-01-15',
                usuario: {
                    ...usuarioBase,
                    date_joined: '2026-01-01',
                },
            }),
        )

        expect(c.fechaRegistro).toBe('2026-01-15')
    })

    it('fechaRegistro cae a usuario.date_joined si no viene fecha_registro', () => {
        const c = toCliente(
            dto({
                fecha_registro: undefined,
                usuario: {
                    ...usuarioBase,
                    date_joined: '2026-01-15',
                },
            }),
        )

        expect(c.fechaRegistro).toBe('2026-01-15')
    })

    it('comuna usa la dirección principal', () => {
        const c = toCliente(
            dto({
                direcciones: [
                    {
                        ...direccionBase,
                        id: 1,
                        comuna_detalle: {
                            id: 1,
                            nombre: 'Providencia',
                        },
                        es_principal: false,
                    },
                    {
                        ...direccionBase,
                        id: 2,
                        comuna_detalle: {
                            id: 2,
                            nombre: 'Las Condes',
                        },
                        es_principal: true,
                    },
                ],
            }),
        )

        expect(c.comuna).toBe('Las Condes')
    })

    it('si no hay dirección principal, comuna usa la primera dirección', () => {
        const c = toCliente(
            dto({
                direcciones: [
                    {
                        ...direccionBase,
                        comuna_detalle: {
                            id: 1,
                            nombre: 'Providencia',
                        },
                        es_principal: false,
                    },
                ],
            }),
        )

        expect(c.comuna).toBe('Providencia')
    })

    it('si no hay direcciones, comuna cae a "—"', () => {
        const c = toCliente(
            dto({
                direcciones: [],
            }),
        )

        expect(c.comuna).toBe('—')
    })

    it('tipoLabel es Particular para cliente particular', () => {
        const c = toCliente(
            dto({
                tipo_cliente: 'PARTICULAR',
                institucion: null,
            }),
        )

        expect(c.tipoLabel).toBe('Particular')
    })

    it('tipoLabel usa subtipo de institución conocido si viene desde el backend', () => {
        const c = toCliente(
            dto({
                tipo_cliente: 'INSTITUCIONAL',
                institucion: {
                    ...institucionBase,
                    tipo_institucion: 'CLINICA',
                },
            }),
        )

        expect(c.tipoLabel).toBe('Clínica')
    })

    it('tipoLabel cae a Institución si el subtipo viene null o desconocido', () => {
        const c = toCliente(
            dto({
                tipo_cliente: 'INSTITUCIONAL',
                institucion: {
                    ...institucionBase,
                    tipo_institucion: null,
                },
            }),
        )

        expect(c.tipoLabel).toBe('Institución')
    })
})