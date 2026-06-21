import type { ID } from './api';

/**
 * Roles y grupos del sistema MEDISTOCK.
 *
 * NOTA: La documentacion solo muestra explicitamente el valor `rol: "CLIENTE"`
 * (endpoint GET /api/accounts/perfil/me/). Los valores de rol para trabajadores
 * NO aparecen literalmente en la doc, por lo que los de abajo son una inferencia
 * razonable a partir del caso de negocio y de los textos de permisos
 * ("Administrador, Ejecutivo o Analista", "Operadores Logisticos", etc.).
 * Confirma estos strings contra el backend antes de usarlos en logica critica.
 */

/** Rol que retorna el endpoint de perfil. */
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
 * Nombres de grupo de Django observados en las respuestas
 * (campo `grupos[].name`).
 */
export type GrupoNombre =
    | 'Trabajadores'
    | 'ClienteParticular'
    | 'ClienteInstitucional'

    | 'Administradores'
    | 'Ejecutivos'
    | 'OperadoresLogisticos'
    | 'Analistas';

/** Grupo de Django tal como aparece en `usuario.grupos`. */
export interface Grupo {
    id: ID;
    name: GrupoNombre | string;
}