// src/types/roles.ts
import type { ID } from './api';



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


const ROL_POR_GRUPO: Array<{ nombre: GrupoNombre; rol: Rol }> = [
    { nombre: 'Administrador',     rol: Roles.ADMINISTRADOR },
    { nombre: 'Ejecutivo',         rol: Roles.EJECUTIVO },
    { nombre: 'OperadorLogistico', rol: Roles.OPERADOR_LOGISTICO },
    { nombre: 'Analista',          rol: Roles.ANALISTA },
];


export function rolDesdeGrupos(grupos: Grupo[]): Rol | null {
    const nombres = new Set(grupos.map((g) => g.name));
    const match = ROL_POR_GRUPO.find((r) => nombres.has(r.nombre));
    return match?.rol ?? null;
}
