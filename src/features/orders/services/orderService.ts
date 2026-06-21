// features/orders/services/orderService.ts
// Repository: métodos de dominio tipados. Único punto del feature que toca lib/axios.
// Command:    cada acción interna (aprobar/rechazar) es un comando reutilizable.
// State:      tabla de transiciones de EstadoPedido para validar avances de pedido.

import api from '@/lib/axios';
import type { Pedido } from '@/types/models';
import type {
    PedidoDTO,
    NuevoPedido,
    EditarPedido,
    AprobarPedido,
    AprobacionDTO,
    EstadoPedido,
    FiltroPedidos,
} from '../types';
import { toPedido } from './mappers/orderMapper';

/** Desenvuelve respuestas DRF paginadas o arrays planos. */
const unwrap = <T>(data: { results?: T[] } | T[]): T[] =>
    Array.isArray(data) ? data : (data.results ?? []);

/* -------------------------------------------------------------------------- */
/*  Máquina de estados del pedido (State, IL3.3)                              */
/*                                                                            */
/*  El avance EN_PICKING → DESPACHADO → ENTREGADO NO se dispara desde la API  */
/*  de pedidos: lo ejecuta Logística al crear/actualizar el envío             */
/*  (/logistics/envios/, ver T3.4/T3.5) y el backend mueve el estado.         */
/*  Aquí vive solo la VALIDACIÓN de qué avance es legal, que la UI consulta   */
/*  antes de habilitar un botón o disparar la mutación correspondiente.       */
/* -------------------------------------------------------------------------- */

const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
    PENDIENTE: ['APROBADO', 'RECHAZADO', 'CANCELADO'],
    APROBADO: ['EN_PICKING', 'CANCELADO'],
    EN_PICKING: ['DESPACHADO', 'CANCELADO'],
    DESPACHADO: ['ENTREGADO'],
    ENTREGADO: [],
    RECHAZADO: [],
    CANCELADO: [],
};

/** Estados a los que un pedido puede avanzar desde `estado`. Vacío = terminal. */
export const transicionesValidas = (estado: EstadoPedido): EstadoPedido[] =>
    TRANSICIONES[estado] ?? [];

/** ¿Es legal mover un pedido de `de` a `a`? Consúltalo antes de cualquier avance. */
export const puedePasar = (de: EstadoPedido, a: EstadoPedido): boolean =>
    transicionesValidas(de).includes(a);

/** ¿El pedido está en un estado terminal (sin avances posibles)? */
export const esEstadoTerminal = (estado: EstadoPedido): boolean =>
    transicionesValidas(estado).length === 0;

/* -------------------------------------------------------------------------- */
/*  Llamada cruda de aprobación/rechazo (Command compartido)                 */
/*                                                                            */
/*  El backend responde una confirmación reducida (AprobacionDTO), no un      */
/*  PedidoDTO completo; por eso no se mapea a Pedido. El hook consumidor debe */
/*  invalidar la query de pedidos para refrescar la fila tras la acción.      */
/*  Un 409 (stock cambió entre compra y aprobación) NO se atrapa aquí: sube   */
/*  como ApiError desde el interceptor de lib/axios y la UI lo traduce        */
/*  ("stock insuficiente"), dejando el pedido en PENDIENTE.                   */
/* -------------------------------------------------------------------------- */

const postAprobacion = async (
    id: string | number,
    payload: AprobarPedido,
): Promise<AprobacionDTO> => {
    const { data } = await api.post<AprobacionDTO>(
        `/orders/pedidos/${id}/aprobar/`,
        payload,
    );
    return data;
};

export const orderService = {
    /** POST /api/orders/pedidos/  (solo clientes) */
    crearPedido: async (payload: NuevoPedido): Promise<Pedido> => {
        const { data } = await api.post<PedidoDTO>('/orders/pedidos/', payload);
        return toPedido(data);
    },

    /** GET /api/orders/pedidos/mis-pedidos/  (solo clientes) */
    misPedidos: async (): Promise<Pedido[]> => {
        const { data } = await api.get('/orders/pedidos/mis-pedidos/');
        return unwrap<PedidoDTO>(data).map(toPedido);
    },

    /** GET /api/orders/pedidos/todos/  (ejecutivos/admin) */
    todosPedidos: async (filtros?: FiltroPedidos): Promise<Pedido[]> => {
        const { data } = await api.get('/orders/pedidos/todos/', { params: filtros });
        return unwrap<PedidoDTO>(data).map(toPedido);
    },

    /** GET /api/orders/pedidos/{id}/  (dueño o trabajador) */
    detallePedido: async (id: string | number): Promise<Pedido> => {
        const { data } = await api.get<PedidoDTO>(`/orders/pedidos/${id}/`);
        return toPedido(data);
    },

    /** PATCH /api/orders/pedidos/{id}/  (cliente dueño, PENDIENTE/APROBADO) */
    editarPedido: async (
        id: string | number,
        payload: EditarPedido,
    ): Promise<Pedido> => {
        const { data } = await api.patch<PedidoDTO>(`/orders/pedidos/${id}/`, payload);
        return toPedido(data);
    },

    /**
     * POST /api/orders/pedidos/{id}/aprobar/  (ejecutivos/admin) — forma cruda.
     * Mantiene el contrato bajo `{ accion, comentario }`.
     * Para la UI prefiere los comandos aprobar()/rechazar().
     */
    aprobarPedido: (
        id: string | number,
        payload: AprobarPedido,
    ): Promise<AprobacionDTO> => postAprobacion(id, payload),

    /** Command: aprobar un pedido PENDIENTE. El comentario es opcional. */
    aprobar: (id: string | number, comentario?: string): Promise<AprobacionDTO> =>
        postAprobacion(id, { accion: 'APROBADO', comentario }),

    /** Command: rechazar un pedido PENDIENTE. Exige motivo para dejar traza. */
    rechazar: (id: string | number, comentario: string): Promise<AprobacionDTO> =>
        postAprobacion(id, { accion: 'RECHAZADO', comentario }),
};
