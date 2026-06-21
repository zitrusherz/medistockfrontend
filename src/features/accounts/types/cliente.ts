// features/accounts/types/cliente.ts
// T3.3 — Tipos del directorio de clientes. SE DECLARAN AQUÍ (no en @/types/models)
// para no tocar el archivo central y mantener el dominio `accounts` autocontenido.
//
// ⚠️ SUPUESTO (confirmar contra la doc de la API): la forma del DTO. No tuve a la
// vista la respuesta real de GET /accounts/clientes/. Si los campos difieren,
// AJUSTA SOLO clienteMapper.ts + estas interfaces; el resto del feature no se entera.

import type { TipoCliente } from '@/types/models';

/** Forma cruda esperada de la API (snake_case). Ajustar si difiere. */
export interface ClienteDTO {
    id: number;
    tipo_cliente: TipoCliente; // PARTICULAR | INSTITUCIONAL
    rut: string;
    email: string;
    telefono: string;
    // Particular
    nombre?: string;
    apellido?: string;
    // Institucional
    razon_social?: string;
    rut_empresa?: string;
    // Crédito (solo institucional, opcional)
    cupo_credito?: number;
    credito_utilizado?: number;
    // Meta
    activo: boolean;
    fecha_registro?: string;
    date_joined?: string;
}

/** Modelo de dominio que consume la UI (camelCase, ya normalizado). */
export interface Cliente {
    id: number;
    tipo: TipoCliente;
    nombre: string; // razón social (institucional) o nombre+apellido (particular)
    rut: string;
    email: string;
    telefono: string;
    cupoCredito: number | null;
    creditoUsado: number | null;
    activo: boolean;
    fechaRegistro: string | null;
}

/** Params del listado (todos opcionales; los vacíos no se envían). */
export interface FiltroClientes {
    tipo_cliente?: TipoCliente;
    activo?: boolean;
    search?: string;
}
