

import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export function useMisPedidos() {
    const query = useQuery({
        queryKey: ['pedidos', 'mis'],
        queryFn: () => orderService.misPedidos(),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    return {
        pedidos: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
