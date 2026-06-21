// src/features/locations/hooks/useComunasChilexpress.ts
// Custom Hook + Observer (React Query) — T3.5. Cobertura Chilexpress para validar
// la comuna de destino antes de cotizar. La cobertura cambia poco → caché larga.

import { useQuery } from '@tanstack/react-query';
import { locationsService } from '../services/locationsService';

export function useComunasChilexpress() {
    const query = useQuery({
        queryKey: ['comunas-chilexpress'],
        queryFn: () => locationsService.getComunasChilexpress(),
        staleTime: 60 * 60_000, // 1 h
        refetchOnWindowFocus: false,
    });

    return {
        comunas: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}
