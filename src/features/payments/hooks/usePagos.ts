

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
