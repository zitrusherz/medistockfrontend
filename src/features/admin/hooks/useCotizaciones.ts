

import { useQuery } from '@tanstack/react-query';
import { adminStatsService } from '../services/adminStatsService';

/** ⇩ Pon en true cuando exista GET /orders/cotizaciones/resumen/. */
export const COTIZACIONES_BACKEND_LISTO = false;

export function useCotizaciones() {
    const query = useQuery({
        queryKey: ['admin', 'cotizaciones', 'resumen'],
        queryFn: () => adminStatsService.cotizacionesResumen(),
        enabled: COTIZACIONES_BACKEND_LISTO,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        /** null = aún no disponible (backend pendiente o cargando). */
        pendientes: query.data?.pendientes ?? null,
        disponible: COTIZACIONES_BACKEND_LISTO && !query.isError,
        isLoading: COTIZACIONES_BACKEND_LISTO && query.isLoading,
        isError: query.isError,
    };
}
