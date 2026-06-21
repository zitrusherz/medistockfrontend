// src/features/inventory/hooks/useLotes.ts
// Custom Hook + Observer (React Query) — T3.5. Lista de lotes para el picking.
// Cambia poco durante una sesión de preparación → staleTime generoso.

import { useQuery } from '@tanstack/react-query';
import { inventoryService, type LoteQuery } from '../services/inventoryService';

export function useLotes(params?: LoteQuery) {
    const query = useQuery({
        queryKey: ['lotes', params ?? null],
        queryFn: () => inventoryService.getLotes(params),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        lotes: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
