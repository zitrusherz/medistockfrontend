// features/orders/hooks/useTodosPedidos.ts
// T3.2 — Lista interna de pedidos (Ejecutivo/Logística/Admin). Observer vía React Query.
//
// queryKey ['pedidos','todos', filtros]: useAccionesPedido invalida el prefijo
// ['pedidos','todos'] tras aprobar/rechazar; invalidateQueries hace match por
// prefijo, así que cualquier variante con filtros también se refresca.
//
// Para la bandeja del Ejecutivo se llama SIN filtros: se trae todo una vez y se
// segmenta en cliente (las pestañas necesitan los contadores por estado, baratos
// de calcular sobre el set completo). Si en el futuro el volumen crece, pasar el
// filtro de estado al server y mover los contadores a un endpoint aparte.

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
