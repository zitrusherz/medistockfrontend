import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';


export function useCategorias() {
  return useQuery({
    queryKey: ['categorias', 'public'],
    queryFn: () => catalogService.getCategorias(),
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
