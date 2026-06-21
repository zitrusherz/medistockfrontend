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

// ---------------------------------------------------------------------------
// Direcciones de entrega
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Perfil propio (GET/PATCH /api/accounts/perfil/me/)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Trabajadores
// ---------------------------------------------------------------------------

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

/**
 * Cuerpo para registrar/crear un trabajador.
 *
 * M4 — Carrier del rol: el rol REAL del backend se materializa como grupo
 * Django en el usuario. Ni `UsuarioRegistro` ni este request traen un campo de
 * rol "oficial", así que añadimos `rol` (enum del caso) de forma explícita y,
 * por compatibilidad, también se envía `cargo` con la etiqueta del rol. El
 * builder (useWorkerForm.ts) es el ÚNICO lugar que decide cómo viaja el rol; si
 * tu backend lo espera anidado en `usuario`, como `grupo`, o lo deriva del
 * `cargo`, se ajusta SOLO ahí.
 */
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

/**
 * Cuerpo de PATCH /api/accounts/trabajadores/{id}/.
 * Para activar/desactivar enviamos `{ activo }` (mismo criterio que
 * ActualizarClienteRequest). Si tu backend usa `is_active` o lo anida bajo
 * `usuario`, cambia SOLO el método `actualizarTrabajador` del accountsService.
 */
export interface ActualizarTrabajadorRequest {
    activo?: boolean;
    telefono?: string;
    direccion?: string;
    comuna?: ID;
    sucursal?: ID;
    cargo?: string;
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

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
