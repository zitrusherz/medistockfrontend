// src/types/roles.ts
import type { ID } from './api';

/**
 * Roles y grupos del sistema MEDISTOCK.
 *
 * `Rol` es el rol INTERNO que usa el frontend para enrutar (RoleRoute,
 * homeByRole, navItems, prefetch). NO es el mismo valor que manda la API en
 * el campo `rol` de GET /accounts/perfil/me/: ese campo solo distingue
 * 'CLIENTE' vs 'TRABAJADOR' (ver `RolApi` en types/auth.ts). El rol
 * específico de un trabajador se deriva de `datos.usuario.grupos[]` con
 * `rolDesdeGrupos()`, definida más abajo.
 *
 * CONFIRMADO contra una respuesta real del backend: los `grupos[].name`
 * vienen en SINGULAR ('Administrador', 'Ejecutivo', 'OperadorLogistico',
 * 'Analista'). Antes este archivo asumía plural ('Administradores', etc.)
 * y por eso ningún grupo hacía match nunca.
 */

/** Rol interno de la app, usado para enrutar y filtrar navegación. */
export type Rol =
    | 'CLIENTE'

    | 'ADMINISTRADOR'
    | 'EJECUTIVO'
    | 'OPERADOR_LOGISTICO'
    | 'ANALISTA';

export const Roles = {
    CLIENTE : 'CLIENTE',
    ADMINISTRADOR : 'ADMINISTRADOR',
    EJECUTIVO : 'EJECUTIVO',
    OPERADOR_LOGISTICO : 'OPERADOR_LOGISTICO',
    ANALISTA : 'ANALISTA'
} as const;


/**
 * Nombres de grupo de Django tal como aparecen en `usuario.grupos[].name`.
 * FIX: estaban en plural; el backend real los manda en singular.
 */
export type GrupoNombre =
    | 'Trabajadores'
    | 'ClienteParticular'
    | 'ClienteInstitucional'

    | 'Administrador'
    | 'Ejecutivo'
    | 'OperadorLogistico'
    | 'Analista';

/** Grupo de Django tal como aparece en `usuario.grupos`. */
export interface Grupo {
    id: ID;
    name: GrupoNombre | string;
}

/**
 * Precedencia para derivar un único `Rol` cuando una cuenta pertenece a más
 * de un grupo de rol a la vez (visto en cuentas de prueba/seed con TODOS
 * los grupos asignados a la vez — ej. una cuenta con `cargo: "Dios"`).
 *
 * ASUNCIÓN A CONFIRMAR con negocio/backend: si en producción un trabajador
 * siempre pertenece a un solo grupo de rol, este orden nunca se ejercita de
 * verdad. Si SÍ pueden tener varios, ajustar el orden según qué panel debe
 * "ganar" quien tenga más de un grupo.
 */
const ROL_POR_GRUPO: Array<{ nombre: GrupoNombre; rol: Rol }> = [
    { nombre: 'Administrador',     rol: Roles.ADMINISTRADOR },
    { nombre: 'Ejecutivo',         rol: Roles.EJECUTIVO },
    { nombre: 'OperadorLogistico', rol: Roles.OPERADOR_LOGISTICO },
    { nombre: 'Analista',          rol: Roles.ANALISTA },
];

/**
 * Deriva el `Rol` interno de la app a partir de `usuario.grupos[]`.
 *
 * 'Trabajadores' se ignora a propósito: es un grupo genérico que tienen
 * TODOS los trabajadores (marca "es staff"), no identifica un rol
 * específico para efectos de enrutamiento.
 *
 * Devuelve `null` si no hay ningún grupo de rol reconocido (cuenta staff
 * sin rol de negocio asignado — caso borde, no debería pasar en cuentas
 * reales bien configuradas).
 */
export function rolDesdeGrupos(grupos: Grupo[]): Rol | null {
    const nombres = new Set(grupos.map((g) => g.name));
    const match = ROL_POR_GRUPO.find((r) => nombres.has(r.nombre));
    return match?.rol ?? null;
}
