// features/orders/hooks/usePedido.ts
// T2.10 — Detalle de un pedido (Observer vía React Query).
// queryKey ['pedidos','detalle', id]: useEditarPedido refresca esta entrada tras el PATCH.

import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export function usePedido(id?: string) {
    const query = useQuery({
        queryKey: ['pedidos', 'detalle', id],
        queryFn: () => orderService.detallePedido(id as string),
        enabled: Boolean(id),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    return {
        pedido: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
    };
}
