

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useSucursalesActivas() {
    const query = useQuery({
        queryKey: ['inventory', 'sucursales'],
        queryFn: () => inventoryService.getSucursales(),
        staleTime: 5 * 60_000,
    });

    return {
        sucursales: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
