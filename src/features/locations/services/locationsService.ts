import api from '@/lib/axios';
import type { Paginated } from '@/types/api';
import type {
    ChilexpressComuna,
    Region,
    RegionConComunas,
    Sucursal,
} from '@/types/models';



/**
 * Algunos listados de DRF pueden volver como arreglo plano o envueltos en el
 * sobre de paginación `{ count, next, previous, results }`. Esta función
 * tolera ambos para no acoplarnos a la config de paginación del backend.
 */
function unwrapList<T>(data: T[] | Paginated<T>): T[] {
    return Array.isArray(data) ? data : data.results;
}

export const locationsService = {
    /**
     * GET /locations/regions-with-comunas/
     * Cada región trae sus comunas ANIDADAS → el select dependiente
     * región→comuna se resuelve con una sola llamada (sin segunda petición).
     */
    async getRegionesConComunas(): Promise<RegionConComunas[]> {
        const { data } = await api.get<RegionConComunas[] | Paginated<RegionConComunas>>(
            '/locations/regions-with-comunas/',
        );
        return unwrapList(data);
    },

    /** GET /locations/regiones/ — regiones sin comunas (uso liviano). */
    async getRegiones(): Promise<Region[]> {
        const { data } = await api.get<Region[] | Paginated<Region>>('/locations/regiones/');
        return unwrapList(data);
    },

    /** GET /locations/sucursales/{id}/ — usado por checkout (H2/T2.8). */
    async getSucursal(id: number): Promise<Sucursal> {
        const { data } = await api.get<Sucursal>(`/locations/sucursales/${id}/`);
        return data;
    },

    /**
     * GET /locations/comunas-chilexpress/ — cobertura courier.
     * Lo consumirá logística en H3 (cotización de envíos). Se deja aquí porque
     * el dominio de ubicaciones es el dueño, no logistics.
     */
    async getComunasChilexpress(): Promise<ChilexpressComuna[]> {
        const { data } = await api.get<ChilexpressComuna[] | Paginated<ChilexpressComuna>>(
            '/locations/comunas-chilexpress/',
        );
        return unwrapList(data);
    },
};
