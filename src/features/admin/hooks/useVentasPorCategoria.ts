// features/admin/hooks/useVentasPorCategoria.ts
// T4.1 — Donut de "ventas por categoría" con datos REALES del backend.
//
// Mientras el backend no publique el endpoint, deja CATEGORIA_BACKEND_LISTO en
// false: el hook no dispara red (`enabled:false`) y la página cae al desglose
// client-side por tipo de venta. Cuando el endpoint exista, cambia la bandera a
// true (un solo lugar) y el donut pasa a categoría real sin tocar nada más.

import { useQuery } from '@tanstack/react-query';
import { adminStatsService } from '../services/adminStatsService';

/** ⇩ Pon en true cuando exista GET /payments/stats/ventas-por-categoria/. */
export const CATEGORIA_BACKEND_LISTO = false;

export function useVentasPorCategoria() {
    const query = useQuery({
        queryKey: ['admin', 'ventas-por-categoria'],
        queryFn: () => adminStatsService.ventasPorCategoria(),
        enabled: CATEGORIA_BACKEND_LISTO,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        /** Disponible solo cuando la bandera está activa y la query resolvió. */
        categorias: query.data ?? [],
        disponible: CATEGORIA_BACKEND_LISTO && !query.isError && !query.isLoading,
        isLoading: CATEGORIA_BACKEND_LISTO && query.isLoading,
        isError: query.isError,
    };
}
