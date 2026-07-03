

import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { FiltroPedidos } from '../types';

export function useTodosPedidos(filtros?: FiltroPedidos) {
    const query = useQuery({
        queryKey: ['pedidos', 'todos', filtros ?? null],
        queryFn: () => orderService.todosPedidos(filtros),
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
