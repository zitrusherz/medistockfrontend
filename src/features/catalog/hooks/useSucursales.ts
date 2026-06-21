// features/catalog/hooks/useSucursales.ts
// T3.3 — Lista de sucursales para el selector de bodega (Observer / React Query).
// Reusa catalogService.getSucursales() (modelo mínimo { id, nombre }).
// Sucursales cambian poco → staleTime alto.

import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export function useSucursales() {
    const query = useQuery({
        queryKey: ['sucursales'],
        queryFn: () => catalogService.getSucursales(),
        staleTime: 60 * 60_000, // 1 h
        refetchOnWindowFocus: false,
    });

    return {
        sucursales: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
