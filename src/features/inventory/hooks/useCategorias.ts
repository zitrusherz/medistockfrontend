// src/features/inventory/hooks/useCategorias.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';


export function useCategorias() {
  return useQuery({
    queryKey: ['inventory', 'categorias'],
    queryFn: () => inventoryService.getCategorias(),
    staleTime: 1000 * 60 * 30, // 30 min
    placeholderData: keepPreviousData,
  });
}