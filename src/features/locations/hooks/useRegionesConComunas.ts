import { useQuery } from '@tanstack/react-query';
import { locationsService } from '../services/locationsService';
import type { Comuna, RegionConComunas } from '@/types/models';

/** Query key estable para regiones+comunas. */
export const regionesQueryKey = ['locations', 'regions-with-comunas'] as const;

/**
 * Carga regiones con sus comunas anidadas y expone un helper para obtener las
 * comunas de una región concreta. Resuelve el select dependiente región→comuna
 * SIN una segunda llamada (las comunas vienen dentro de cada región).
 *
 * Las ubicaciones cambian rarísimo, así que se cachea de forma agresiva.
 */
export function useRegionesConComunas() {
    const query = useQuery({
        queryKey: regionesQueryKey,
        queryFn: () => locationsService.getRegionesConComunas(),
        staleTime: 1000 * 60 * 60, // 1 hora "fresco"
        gcTime: 1000 * 60 * 60 * 24, // 1 día en caché
        refetchOnWindowFocus: false,
    });

    const regiones: RegionConComunas[] = query.data ?? [];

    /** Comunas de una región por su ID. Devuelve [] si no hay región. */
    const getComunas = (regionId: number | null): Comuna[] => {
        if (regionId == null) return [];
        return regiones.find((r) => r.id === regionId)?.comunas ?? [];
    };

    return { ...query, regiones, getComunas };
}
