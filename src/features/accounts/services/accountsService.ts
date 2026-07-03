

import api from '@/lib/axios';
import type {
    RegistroClienteRequest,
    RegistroClienteResponse,
    DireccionEntrega,
    DireccionEntregaInput,
    RegistroTrabajadorRequest,
    RegistroTrabajadorResponse,
    ActualizarTrabajadorRequest,
    Trabajador,
} from '../types';
import type { Cliente, ClienteDTO, FiltroClientes } from '../types/cliente';
import type { TrabajadorVM, FiltroTrabajadores } from '../types/trabajador';
import { toCliente } from './mappers/clienteMapper';
import { toTrabajador } from './mappers/workerMapper';

/** Tolera respuesta como arreglo plano o sobre DRF { results }. */
function unwrapList<T>(data: T[] | { results?: T[] }): T[] {
    return Array.isArray(data) ? data : (data.results ?? []);
}

/** Quita params vacíos antes del query string. */
const cleanParams = (
    obj: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([, v]) => v !== undefined && v !== '' && v !== null,
        ),
    ) as Record<string, string | number | boolean>;

export const accountsService = {
    /** POST /accounts/registro/cliente/ — crea cliente B2C + dirección. */
    async registrarCliente(
        body: RegistroClienteRequest,
    ): Promise<RegistroClienteResponse> {
        const { data } = await api.post<RegistroClienteResponse>(
            '/accounts/registro/cliente/',
            body,
        );
        return data;
    },

    /** GET /accounts/mis-direcciones/ — direcciones del cliente autenticado. */
    async getMisDirecciones(): Promise<DireccionEntrega[]> {
        const { data } = await api.get<
            DireccionEntrega[] | { results?: DireccionEntrega[] }
        >('/accounts/mis-direcciones/');
        return unwrapList(data);
    },


    async crearMiDireccion(
        body: DireccionEntregaInput,
    ): Promise<DireccionEntrega> {
        const { data } = await api.post<DireccionEntrega>(
            '/accounts/mis-direcciones/',
            body,
        );
        return data;
    },

    /**
     * GET /accounts/clientes/  (Ejecutivo: lectura · Admin: gestión, T4.4)
     * ⚠️ SUPUESTO de ruta. Si tu API expone el listado en otra URL, cámbiala aquí.
     */
    async clientes(filtros: FiltroClientes = {}): Promise<Cliente[]> {
        const { data } = await api.get<ClienteDTO[] | { results?: ClienteDTO[] }>(
            '/accounts/clientes/',
            {
                params: cleanParams({
                    tipo_cliente: filtros.tipo_cliente,
                    activo: filtros.activo,
                    search: filtros.search,
                }),
            },
        );
        return unwrapList(data).map(toCliente);
    },

    /** GET /accounts/clientes/{id}/ — detalle (crédito, etc.). */
    async cliente(id: string | number): Promise<Cliente> {
        const { data } = await api.get<ClienteDTO>(`/accounts/clientes/${id}/`);
        return toCliente(data);
    },

    /* ---------------------------------------------------------------------- */
    /*  Trabajadores (T4.3 — solo Administrador)                              */
    /* ---------------------------------------------------------------------- */

    /**
     * GET /accounts/trabajadores/ — equipo interno, ya normalizado a TrabajadorVM.
     * El filtro de texto/rol normalmente se aplica en cliente (ver useTrabajadores),
     * pero también se aceptan params por si quieres filtrar en servidor.
     */
    async trabajadores(filtros: FiltroTrabajadores = {}): Promise<TrabajadorVM[]> {
        const { data } = await api.get<Trabajador[] | { results?: Trabajador[] }>(
            '/accounts/trabajadores/',
            {
                params: cleanParams({
                    rol: filtros.rol,
                    activo: filtros.activo,
                    search: filtros.search,
                }),
            },
        );
        return unwrapList(data).map(toTrabajador);
    },

    /** POST /accounts/registro/trabajador/ — crea la cuenta interna. */
    async registrarTrabajador(
        body: RegistroTrabajadorRequest,
    ): Promise<RegistroTrabajadorResponse> {
        const { data } = await api.post<RegistroTrabajadorResponse>(
            '/accounts/registro/trabajador/',
            body,
        );
        return data;
    },


    async actualizarTrabajador(
        id: string | number,
        body: ActualizarTrabajadorRequest,
    ): Promise<TrabajadorVM> {
        const { data } = await api.patch<Trabajador>(
            `/accounts/trabajadores/${id}/`,
            body,
        );
        return toTrabajador(data);
    },
};
