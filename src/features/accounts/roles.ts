

import { Roles, type Rol } from '@/types/roles';
import type { Grupo, GrupoNombre } from '@/types/roles';

/**
 * Roles que un trabajador puede tener (CLIENTE queda fuera a propósito: un
 * trabajador nunca es cliente). Estos son los del CASO, no los de la maqueta
 * (Ventas/Bodega/Soporte/Finanzas), cumpliendo M4.
 */
export const WORKER_ROLES = [
    Roles.ADMINISTRADOR,
    Roles.EJECUTIVO,
    Roles.OPERADOR_LOGISTICO,
    Roles.ANALISTA,
] as const;

export type WorkerRol = (typeof WORKER_ROLES)[number];

/** Etiqueta humana de cada rol (la nomenclatura del caso MEDISTOCK). */
const ROL_LABEL: Record<WorkerRol, string> = {
    ADMINISTRADOR: 'Administrador',
    EJECUTIVO: 'Ejecutivo de Cuentas',
    OPERADOR_LOGISTICO: 'Operador Logístico',
    ANALISTA: 'Analista de Finanzas',
};

/** Opciones listas para el componente <Select> del kit ({ value, label }). */
export const WORKER_ROLE_OPTIONS: { value: WorkerRol; label: string }[] =
    WORKER_ROLES.map((r) => ({ value: r, label: ROL_LABEL[r] }));

/** Type guard: ¿este string es un rol de trabajador válido? */
export const isWorkerRol = (v: string): v is WorkerRol =>
    (WORKER_ROLES as readonly string[]).includes(v);

/** Etiqueta legible para mostrar (tabla/badge). Cae a "—" si no hay rol. */
export const rolLabel = (rol: Rol | null | undefined): string =>
    rol && isWorkerRol(rol) ? ROL_LABEL[rol] : '—';

/* -------------------------------------------------------------------------- */
/*  Grupo Django -> Rol                                                        */
/*  El backend expone el rol como pertenencia a un grupo (campo `name` en      */
/*  `usuario.grupos[]`). Un usuario puede traer varios grupos (p. ej.          */
/*  "Trabajadores" + "OperadoresLogisticos"); tomamos el primero específico.   */
/* -------------------------------------------------------------------------- */

const GRUPO_TO_ROL: Partial<Record<GrupoNombre, WorkerRol>> = {
    Administrador: 'ADMINISTRADOR',
    Ejecutivo: 'EJECUTIVO',
    OperadorLogistico: 'OPERADOR_LOGISTICO',
    Analista: 'ANALISTA',
};

/** Deriva el Rol de trabajador desde sus grupos. `null` si no hay match. */
export const grupoToRol = (grupos: Grupo[] | undefined | null): WorkerRol | null => {
    if (!grupos) return null;
    for (const g of grupos) {
        const r = GRUPO_TO_ROL[g.name as GrupoNombre];
        if (r) return r;
    }
    return null;
};
