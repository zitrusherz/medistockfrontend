import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

/**
 * useCategorias — categorías públicas para filtros del catálogo y la landing.
 * Capa: hook → service → axios (nunca llama axios directo). *(Layered + Observer)*
 *
 * Requiere que `catalogService` exponga `getCategorias()` apuntando a
 * `GET /public/categorias` (ver T2.1). Si tu service aún no lo tiene, añade:
 *
 *   async getCategorias(): Promise<Categoria[]> {
 *     const { data } = await api.get('/public/categorias');
 *     return (data.results ?? data).map(toCategoria);
 *   }
 *
 * Las categorías cambian poco: staleTime alto evita refetch innecesario.
 */
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias', 'public'],
    queryFn: () => catalogService.getCategorias(),
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
