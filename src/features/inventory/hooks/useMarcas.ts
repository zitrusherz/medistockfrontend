

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useMarcas() {
    const query = useQuery({
        queryKey: ['inventory', 'marcas'],
        queryFn: () => inventoryService.getMarcas(),
        staleTime: 5 * 60_000,
    });

    return {
        marcas: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
