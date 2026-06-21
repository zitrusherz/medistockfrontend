// src/features/inventory/hooks/useSucursalesActivas.ts
// Custom Hook + Observer (React Query). Sucursales activas para el <select> de
// stock inicial del alta (T4.2). staleTime largo: cambian poco.

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useSucursalesActivas() {
    const query = useQuery({
        queryKey: ['inventory', 'sucursales'],
        queryFn: () => inventoryService.getSucursales(),
        staleTime: 5 * 60_000,
    });

    return {
        sucursales: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
