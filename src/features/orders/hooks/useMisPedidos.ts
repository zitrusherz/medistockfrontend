// features/orders/hooks/useMisPedidos.ts
// T2.10 — Lista de pedidos del cliente (Observer vía React Query).
// queryKey ['pedidos','mis'] es la que invalida useEditarPedido tras un PATCH.

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
