

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useAlertasStock() {
    const query = useQuery({
        queryKey: ['alertas', 'stock'],
        queryFn: () => inventoryService.getAlertasStock(),
        staleTime: 60_000,
    });

    return {
        alertas: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
    };
}
