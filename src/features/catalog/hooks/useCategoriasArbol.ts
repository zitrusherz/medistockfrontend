

import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export function useCategoriasArbol() {
    return useQuery({
        queryKey: ['categorias', 'arbol', 'public'],
        queryFn: () => catalogService.getCategoriasArbol(),
        staleTime: 1000 * 60 * 30, // 30 min
    });
}
