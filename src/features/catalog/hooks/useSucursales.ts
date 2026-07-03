

import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export function useSucursales() {
    const query = useQuery({
        queryKey: ['sucursales'],
        queryFn: () => catalogService.getSucursales(),
        staleTime: 60 * 60_000, // 1 h
        refetchOnWindowFocus: false,
    });

    return {
        sucursales: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
