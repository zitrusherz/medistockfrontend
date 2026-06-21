// features/payments/hooks/usePagos.ts
// T3.7 — Lista interna de pagos (Analista/Admin). Observer vía React Query.
//
// queryKey ['pagos','todos', filtros]: los filtros van DENTRO de la key, así
// cada combinación (estado + método) cachea por separado y no se pisan. Llamarlo
// sin filtros (usePagos()) usa `null` y comparte la key con cualquier otra vista
// que pida "todos los pagos sin filtrar" → React Query deduplica la red.
//
// Espejo deliberado de useTodosPedidos: misma forma de retorno para que las
// páginas del panel interno se escriban igual sin sorpresas.

import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import type { TodosPagosFilters } from '../types';

export function usePagos(filtros?: TodosPagosFilters) {
    const query = useQuery({
        queryKey: ['pagos', 'todos', filtros ?? null],
        queryFn: () => paymentService.todosPagos(filtros),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    return {
        pagos: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
