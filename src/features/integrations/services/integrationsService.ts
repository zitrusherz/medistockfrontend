

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
