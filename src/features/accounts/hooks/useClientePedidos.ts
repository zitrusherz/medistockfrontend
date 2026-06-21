// features/accounts/hooks/useClientePedidos.ts
// T3.3 — Pedidos de un cliente, para el tab "Pedidos" del detalle. Reusa
// orderService.todosPedidos({ cliente_id }) (FiltroPedidos ya soporta cliente_id).
// Perezoso: enabled cuando el modal está abierto.

import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/features/orders/services/orderService';

export function useClientePedidos(clienteId?: number, enabled = false) {
    const query = useQuery({
        queryKey: ['pedidos', 'cliente', clienteId],
        queryFn: () => orderService.todosPedidos({ cliente_id: clienteId }),
        enabled: enabled && clienteId != null,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    return {
        pedidos: query.data ?? [],
        isLoading: query.isLoading,
        isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
        isError: query.isError,
    };
}
