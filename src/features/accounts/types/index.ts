// src/features/accounts/types/index.ts
import type { ID } from '@/types/api';
import type { Rol } from '@/types/roles';
import type {
    ComunaRef,
    InstitucionRef,
    RegionRef,
    TipoCliente,
    UsuarioBasico,
    UsuarioDetalle,
    UsuarioRegistro,
} from '@/types/models';

/**
 * Tipos del modulo Cuentas:
 * - Perfil propio (cliente)
 * - Trabajadores (CRUD)
 * - Clientes (CRUD)
 * - Direcciones de entrega del cliente
 */



/** Direccion de entrega tal como la devuelve la API. */
export interface DireccionEntrega {
    id: ID;
    direccion: string;
    num_direccion: string;
    detalle_direccion: string;
    /** ID de la comuna (FK). */
    comuna: ID;
    comuna_detalle: ComunaRef;
    region: RegionRef;
    referencia: string;
    nombre_receptor: string;
    telefono_receptor: string;
    es_principal: boolean;
}

/** Cuerpo para crear/editar una direccion de entrega. */
export interface DireccionEntregaInput {
    direccion: string;
    num_direccion?: string;
    detalle_direccion?: string;
    /** ID de la comuna. */
    comuna: ID;
    referencia?: string;
    nombre_receptor?: string;
    telefono_receptor?: string;
    /** Por defecto false. */
    es_principal?: boolean;
}



/**
 * Datos del cliente en su propio perfil.
 * OJO: aqui `institucion` es el ID (number) o null, a diferencia del
 * endpoint de listado de clientes donde es un objeto InstitucionRef.
 */
export interface PerfilClienteData {
    id: ID;
    rut: string;
    pasaporte: string | null;
    telefono: string;
    email: string;
    first_name: string;
    last_name: string;
    institucion: ID | null;
    direccion_principal: DireccionEntrega | null;
}

/**
 * Respuesta de GET /api/accounts/perfil/me/.
 * La doc solo documenta el caso CLIENTE; para trabajadores la forma de
 * `datos` puede diferir (se asume Trabajador). Discriminar por `rol`.
 */
export interface PerfilMeResponse {
    rol: Rol;
    datos: PerfilClienteData | Trabajador;
}

/** Cuerpo de PATCH /api/accounts/perfil/me/ (solo cliente). */
export interface ActualizarMiPerfilRequest {
    telefono?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    direccion?: string;
    num_direccion?: string;
    detalle_direccion?: string;
    /** ID de la comuna. */
    comuna?: ID;
}



/** Trabajador (listado/detalle). */
export interface Trabajador {
    id: ID;
    usuario: UsuarioDetalle;
    rut: string;
    telefono: string;
    direccion: string;
    /** ID de la comuna. */
    comuna: ID;
    /** ID de la sucursal. */
    sucursal: ID;
    cargo: string;
    activo: boolean;
}


export interface RegistroTrabajadorRequest {
    usuario: UsuarioRegistro;
    rut: string;
    telefono?: string;
    direccion?: string;
    comuna?: ID;
    sucursal?: ID;
    cargo?: string;
    /** Rol del caso (ADMINISTRADOR | EJECUTIVO | OPERADOR_LOGISTICO | ANALISTA). */
    rol?: Rol;
}

/** Respuesta 201 al crear un trabajador (usuario en forma basica). */
export interface RegistroTrabajadorResponse {
    id: ID;
    usuario: UsuarioBasico;
    rut: string;
    telefono: string;
    direccion: string;
    comuna: ID;
    sucursal: ID;
    cargo: string;
    activo: boolean;
}


export interface ActualizarTrabajadorRequest {
    activo?: boolean;
    telefono?: string;
    direccion?: string;
    comuna?: ID;
    sucursal?: ID;
    cargo?: string;
}



/**
 * Cliente (listado/detalle).
 * Aqui `institucion` es un objeto InstitucionRef o null.
 */
export interface Cliente {
    id: ID;
    usuario: UsuarioDetalle;
    rut: string;
    pasaporte: string | null;
    tipo_cliente: TipoCliente;
    telefono: string;
    institucion: InstitucionRef | null;
    activo: boolean;
}

/** Datos para crear una institucion nueva durante el registro de cliente. */
export interface DatosInstitucionInput {
    razon_social: string;
    rut_empresa: string;
    [key: string]: unknown;
}

/** Cuerpo para registrar/crear un cliente. */
export interface RegistroClienteRequest {
    usuario: UsuarioRegistro;
    /** Requerido si tipo_cliente es INSTITUCIONAL. */
    rut?: string;
    /** Requerido si no hay RUT. */
    pasaporte?: string | null;
    tipo_cliente: TipoCliente;
    telefono?: string;
    /** ID de institucion existente. */
    institucion_id?: ID | null;
    /** Datos de institucion nueva (si no existe). */
    datos_institucion?: DatosInstitucionInput | null;
    direccion_entrega: DireccionEntregaInput;
}

/** Respuesta 201 al registrar un cliente. */
export interface RegistroClienteResponse {
    id: ID;
    usuario: UsuarioBasico;
    rut: string;
    pasaporte: string | null;
    tipo_cliente: TipoCliente;
    telefono: string;
    institucion: InstitucionRef | null;
    activo: boolean;
    mensaje: string;
}

/** Cuerpo de PATCH /api/accounts/clientes/{id}/. */
export interface ActualizarClienteRequest {
    rut?: string;
    pasaporte?: string | null;
    tipo_cliente?: TipoCliente;
    telefono?: string;
    activo?: boolean;
}
