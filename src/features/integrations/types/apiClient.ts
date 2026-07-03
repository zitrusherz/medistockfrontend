

/** Estado de presentación para el badge de la tabla. */
export type EstadoApiKey = 'ACTIVA' | 'VENCIDA' | 'REVOCADA';

/** ApiClient ya normalizado para la tabla y las acciones (rotar/revocar). */
export interface ApiClientVM {
    /** ID del ApiClient (el de la URL de PATCH /integrations/api-clients/{id}/). */
    id: number;
    institucion: string;
    institucionId: number | null;
    /** Nombre legible de la integración (nombre_cliente_api). */
    nombre: string;
    activo: boolean;
    limiteRequestsDiario: number;
    /** ISO 8601 o null. */
    fechaCreacion: string | null;
    /** ISO 8601 o null (null = sin vencimiento). */
    fechaExpiracion: string | null;
    vencida: boolean;
    /** No la guarda la API: se deriva en el mapper a partir de activo + vencida. */
    estado: EstadoApiKey;
}
