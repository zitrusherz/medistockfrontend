// features/inventory/hooks/useAlertasVencimiento.ts
// Custom Hook + Observer (React Query). Los vencimientos cambian poco a lo largo
// del día (un lote no se mueve de fecha) → staleTime más holgado.

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useAlertasVencimiento() {
    const query = useQuery({
        queryKey: ['alertas', 'vencimiento'],
        queryFn: () => inventoryService.getAlertasVencimiento(),
        staleTime: 5 * 60_000, // 5 min
    });

    return {
        alertas: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
    };
}
