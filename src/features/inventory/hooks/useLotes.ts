

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
