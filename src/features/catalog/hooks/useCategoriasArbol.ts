// src/features/catalog/hooks/useCategoriasArbol.ts
// Hook → service → axios (nunca llama axios directo). *(Layered)*
//
// Entrega el ÁRBOL de categorías públicas (raíces + subcategorias, con imagen)
// para el mega-menú del navbar. Las categorías cambian poco: staleTime alto
// evita refetch innecesario, igual que en useCategorias.

import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export function useCategoriasArbol() {
    return useQuery({
        queryKey: ['categorias', 'arbol', 'public'],
        queryFn: () => catalogService.getCategoriasArbol(),
        staleTime: 1000 * 60 * 30, // 30 min
    });
}
