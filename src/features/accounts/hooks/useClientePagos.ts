

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/features/payments/services/paymentService';

export function useClientePagos(clienteId?: number, enabled = false) {
    const query = useQuery({
        queryKey: ['pagos', 'todos', null], // comparte caché con usePagos()
        queryFn: () => paymentService.todosPagos(),
        enabled: enabled && clienteId != null,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    const pagos = useMemo(
        () => (query.data ?? []).filter((p) => p.clienteId === clienteId),
        [query.data, clienteId],
    );

    return {
        pagos,
        isLoading: query.isLoading,
        isEmpty: !query.isLoading && pagos.length === 0,
        isError: query.isError,
    };
}
