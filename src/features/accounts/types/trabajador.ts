

import type { WorkerRol } from '../roles';

/** Trabajador ya normalizado para la tabla y las acciones de la vista. */
export interface TrabajadorVM {
    /** ID del trabajador (el de la URL de PATCH /accounts/trabajadores/{id}/). */
    id: number;
    nombre: string;
    email: string;
    rut: string;
    telefono: string;
    /** Rol derivado de `usuario.grupos`. `null` si el backend aún no asignó grupo. */
    rol: WorkerRol | null;
    cargo: string;
    sucursalId: number | null;
    activo: boolean;
    /** Fecha de ingreso (date_joined del usuario), ISO o null. */
    fechaIngreso: string | null;
}

/** Params del listado (todos opcionales; los vacíos no se envían). */
export interface FiltroTrabajadores {
    rol?: WorkerRol;
    activo?: boolean;
    search?: string;
}
