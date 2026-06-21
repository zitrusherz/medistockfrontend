// src/features/integrations/services/integrationsService.ts
// T4.5 — Repository del dominio `integrations`. Gestiona los ApiClient / API Keys
// que permiten a los ERP de las clínicas consumir la API propia con header
// `X-Api-Key` (3ª integración). El listado se entrega como VM (toApiClient); las
// respuestas de crear/rotar se devuelven CRUDAS porque exponen `api_key` en
// texto plano (visible una sola vez).
//
// Rutas:
//   - crear  : POST  /integrations/api-clients/crear/      (doc en types/index.ts)
//   - patch  : PATCH /integrations/api-clients/{id}/        (doc en types/index.ts)
//   - listar : GET   /integrations/api-clients/   ⚠️ SUPUESTO de ruta. Si tu API
//     expone el listado en otra URL, cámbialo SOLO aquí.

import api from '@/lib/axios';
import type {
    ApiClient,
    CrearApiClientRequest,
    CrearApiClientResponse,
    ActualizarApiClientRequest,
    ActualizarApiClientResponse,
} from '../types';
import type { ApiClientVM } from '../types/apiClient';
import { toApiClient } from './mappers/apiClientMapper';

/** Tolera respuesta como arreglo plano o sobre envoltura DRF { results }. */
function unwrapList<T>(data: T[] | { results?: T[] }): T[] {
    return Array.isArray(data) ? data : (data.results ?? []);
}

export const integrationsService = {
    /** GET /integrations/api-clients/ — listado, ya normalizado a VM. */
    async apiClients(): Promise<ApiClientVM[]> {
        const { data } = await api.get<ApiClient[] | { results?: ApiClient[] }>(
            '/integrations/api-clients/',
        );
        return unwrapList(data).map(toApiClient);
    },

    /**
     * POST /integrations/api-clients/crear/ — crea una API Key.
     * La respuesta es la ÚNICA vez que se ve `api_key` en texto plano.
     */
    async crearApiClient(
        body: CrearApiClientRequest,
    ): Promise<CrearApiClientResponse> {
        const { data } = await api.post<CrearApiClientResponse>(
            '/integrations/api-clients/crear/',
            body,
        );
        return data;
    },

    /**
     * PATCH /integrations/api-clients/{id}/ — actualización parcial.
     * Tres usos: revocar `{ activo:false }`, reactivar `{ activo:true }`,
     * rotar `{ rotar_key:true }` (devuelve `nueva_api_key`, también una sola vez).
     */
    async actualizarApiClient(
        id: string | number,
        body: ActualizarApiClientRequest,
    ): Promise<ActualizarApiClientResponse> {
        const { data } = await api.patch<ActualizarApiClientResponse>(
            `/integrations/api-clients/${id}/`,
            body,
        );
        return data;
    },

    /** Atajo: genera una nueva key e invalida la anterior. */
    rotarKey(id: string | number): Promise<ActualizarApiClientResponse> {
        return integrationsService.actualizarApiClient(id, { rotar_key: true });
    },

    /** Atajo: desactiva la key (acción destructiva; confirmar en UI antes). */
    revocarKey(id: string | number): Promise<ActualizarApiClientResponse> {
        return integrationsService.actualizarApiClient(id, { activo: false });
    },

    /** Atajo: reactiva una key revocada. */
    reactivarKey(id: string | number): Promise<ActualizarApiClientResponse> {
        return integrationsService.actualizarApiClient(id, { activo: true });
    },
};
