

import type { InstitucionRef, TipoCliente, UsuarioDetalle } from '@/types/models';
import type { DireccionEntrega } from './index';

/** Subtipos de institución que la UI sabe etiquetar. Whitelist cerrada. */
export type TipoInstitucion =
    | 'HOSPITAL'
    | 'CLINICA'
    | 'LABORATORIO'
    | 'CENTRO_MEDICO'
    | 'FARMACIA';

export const TIPO_INSTITUCION_LABEL: Record<TipoInstitucion, string> = {
    HOSPITAL: 'Hospital',
    CLINICA: 'Clínica',
    LABORATORIO: 'Laboratorio',
    CENTRO_MEDICO: 'Centro médico',
    FARMACIA: 'Farmacia',
};

/**
 * InstitucionRef + tipo opcional. Se extiende AQUÍ (local a este DTO) para no
 * tocar el InstitucionRef central de @/types/models, que otras features usan
 * sin este campo.
 */
export interface InstitucionClienteDTO extends InstitucionRef {
    /** Puede venir null (confirmado en data real) o un string fuera de la
     * whitelist; el mapper valida antes de usarlo. */
    tipo_institucion?: string | null;
}

/** Forma cruda real de GET /accounts/clientes/ (confirmada contra la API). */
export interface ClienteDTO {
    id: number;
    usuario: UsuarioDetalle; // first_name, last_name, email, username...
    tipo_cliente: TipoCliente; // PARTICULAR | INSTITUCIONAL
    rut: string;
    pasaporte?: string | null;
    telefono: string;
    /** Solo si tipo_cliente === 'INSTITUCIONAL'; null en particulares. */
    institucion: InstitucionClienteDTO | null;
    /**
     * Direcciones del cliente. Se lee la marcada `es_principal`; si ninguna
     * lo está, la primera. Puede venir vacío en data de prueba, aunque el
     * negocio espera que siempre haya al menos una — no se asume.
     */
    direcciones: DireccionEntrega[];
    activo: boolean;
    // Crédito: no confirmado contra la API real; el mapper lo tolera con `??`.
    cupo_credito?: number;
    credito_utilizado?: number;
    fecha_registro?: string;
}

/** Modelo de dominio que consume la UI (camelCase, ya normalizado). */
export interface Cliente {
    id: number;
    tipo: TipoCliente; // enum crudo — se usa para filtrar (select Institución/Particular)
    nombre: string; // razón social (institucional) o nombre+apellido (particular)
    /** Texto a mostrar en el badge de Tipo: "Particular", "Institución" o subtipo. */
    tipoLabel: string;
    rut: string;
    email: string;
    telefono: string;
    /** Comuna de la dirección principal; "—" si el cliente no tiene ninguna. */
    comuna: string;
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