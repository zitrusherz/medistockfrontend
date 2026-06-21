// src/features/inventory/hooks/useMarcas.ts
// Custom Hook + Observer (React Query). Marcas para el <select> del alta (T4.2).
// Catálogo casi estático → staleTime largo (5 min). Key namespaced para no
// chocar con la query de marcas públicas del feature catálogo.

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
