

import type { ApiClient } from '../../types';
import type { ApiClientVM, EstadoApiKey } from '../../types/apiClient';

/** Deriva el estado para el badge a partir de activo + vencida. */
const deriveEstado = (activo: boolean, vencida: boolean): EstadoApiKey => {
    if (!activo) return 'REVOCADA';
    if (vencida) return 'VENCIDA';
    return 'ACTIVA';
};

export const toApiClient = (dto: ApiClient): ApiClientVM => ({
    id: Number(dto.id),
    institucion: dto.institucion ?? '—',
    institucionId: dto.institucion_id != null ? Number(dto.institucion_id) : null,
    nombre: dto.nombre_cliente_api ?? '—',
    activo: dto.activo ?? false,
    limiteRequestsDiario: Number(dto.limite_requests_diario ?? 0),
    fechaCreacion: dto.fecha_creacion ?? null,
    fechaExpiracion: dto.fecha_expiracion ?? null,
    vencida: dto.vencida ?? false,
    estado: deriveEstado(dto.activo ?? false, dto.vencida ?? false),
});
