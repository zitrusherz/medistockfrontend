// src/types/auth.ts
/**
 * Tipos de autenticacion (JWT) - modulo Autenticacion de la API.
 * Cubre login custom y simplejwt, refresh y logout.
 */
import type { UsuarioDetalle } from './models';

/** Credenciales de login (POST /api/accounts/login/ y POST /api/token/). */
export interface LoginRequest {
    username: string;
    password: string;
}

/** Par de tokens devuelto al iniciar sesion. */
export interface TokenPair {
    refresh: string;
    access: string;
}

/** Respuesta de login. */
export type LoginResponse = TokenPair;

/** Cuerpo para renovar el access token. */
export interface RefreshRequest {
    refresh: string;
}

/** Respuesta de refresh (solo nuevo access token). */
export interface RefreshResponse {
    access: string;
}

/** Cuerpo para invalidar (blacklist) un refresh token. */
export interface LogoutRequest {
    refresh: string;
}

/** Respuesta de logout (HTTP 205). */
export interface LogoutResponse {
    detail: string;
}

/**
 * Estado de sesion sugerido para el store de auth.
 * (No proviene directo de la API; es un helper para el frontend.)
 */
export interface AuthSession {
    access: string;
    refresh: string;
}


export interface ComunaDetalle {
    id: number;
    nombre: string;
}

export interface RegionDetalle {
    id: number;
    nombre: string;
}

export interface DireccionPrincipal {
    id: number;
    direccion: string;
    num_direccion: string;
    detalle_direccion: string;
    comuna: number;
    comuna_detalle: ComunaDetalle;
    region: RegionDetalle;
    referencia: string;
    nombre_receptor: string;
    telefono_receptor: string;
    es_principal: boolean;
}

// ── Valor crudo de `rol` en la respuesta de la API ───────────────────────────

/**
 * Valor crudo del campo `rol` en GET /accounts/perfil/me/.
 *
 * OJO: esto NO es el mismo `Rol` de types/roles.ts (ese es el rol INTERNO
 * de la app, usado para enrutar). La API solo distingue CLIENTE vs
 * TRABAJADOR; el rol específico de un trabajador (Administrador/Ejecutivo/
 * OperadorLogistico/Analista) vive en `datos.usuario.grupos[]` y se deriva
 * con `rolDesdeGrupos()` (types/roles.ts). Confirmado con una respuesta real
 * del backend.
 */
export type RolApi = 'CLIENTE' | 'TRABAJADOR';

// ── Variantes de `datos` por rol ─────────────────────────────────────────────

/** Campos comunes a un perfil de CLIENTE. */
export interface PerfilDatosBase {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    telefono: string | null;
}

/** `datos` cuando rol = CLIENTE. */
export interface PerfilDatosCliente extends PerfilDatosBase {
    rut: string | null;
    pasaporte: string | null;
    /** ID de institución, o null si es paciente particular (B2C). */
    institucion: number | null;
    /** Puede venir null si el cliente aún no registra dirección. */
    direccion_principal: DireccionPrincipal | null;
}

/**
 * `datos` cuando rol = TRABAJADOR (Administrador, Ejecutivo, Operador,
 * Analista).
 *
 * FIX: NO es plano como PerfilDatosCliente — los datos de cuenta (nombre,
 * email, grupos) vienen anidados en `usuario`. Shape confirmado con una
 * respuesta real del backend:
 *   { id, usuario: {...UsuarioDetalle}, rut, telefono, direccion, comuna,
 *     sucursal, cargo, activo }
 */
export interface PerfilDatosTrabajador {
    id: number;
    usuario: UsuarioDetalle;
    rut: string | null;
    telefono: string | null;
    direccion: string | null;
    /** ID de comuna. */
    comuna: number | null;
    /** ID de sucursal donde trabaja. */
    sucursal: number | null;
    cargo: string | null;
    activo: boolean;
}

// ── Sobre de respuesta (discriminado por `rol`) ──────────────────────────────

export interface PerfilMeCliente {
    rol: Extract<RolApi, 'CLIENTE'>;
    datos: PerfilDatosCliente;
}

export interface PerfilMeTrabajador {
    rol: Extract<RolApi, 'TRABAJADOR'>;
    datos: PerfilDatosTrabajador;
}

/**
 * Respuesta de GET /accounts/perfil/me/.
 * Discrimina por `rol`: estrechar con `if (perfil.rol === 'CLIENTE')`
 * para acceder a campos solo-cliente con seguridad de tipos.
 */
export type PerfilMe = PerfilMeCliente | PerfilMeTrabajador;

/**
 * Nombre/apellido/email del usuario autenticado, sin importar si es
 * CLIENTE o TRABAJADOR (las dos formas anidan estos campos distinto).
 *
 * Úsalo en la UI en vez de leer `perfil.datos.first_name` directo — ese
 * acceso solo es válido para CLIENTE y para TRABAJADOR siempre da
 * `undefined` (el campo real está en `perfil.datos.usuario.first_name`).
 */
export function datosBasicosPerfil(perfil: PerfilMe): {
    first_name: string;
    last_name: string;
    email: string;
} {
    if (perfil.rol === 'CLIENTE') {
        const { first_name, last_name, email } = perfil.datos;
        return { first_name, last_name, email };
    }
    const { first_name, last_name, email } = perfil.datos.usuario;
    return { first_name, last_name, email };
}

// ── Body del PATCH (solo cliente) ────────────────────────────────────────────

/** Cuerpo de PATCH /accounts/perfil/me/. Todos opcionales (actualización parcial). */
export interface PerfilUpdateRequest {
    telefono?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    direccion?: string;
    num_direccion?: string;
    detalle_direccion?: string;
    comuna?: number;
}
