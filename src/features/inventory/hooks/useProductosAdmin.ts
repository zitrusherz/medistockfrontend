

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useProductosAdmin() {
    const query = useQuery({
        queryKey: ['productos', 'admin'],
        queryFn: () => inventoryService.getProductosCatalogo({}),
        staleTime: 60_000,
    });

    return {
        productos: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
