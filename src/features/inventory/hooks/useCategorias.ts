import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalogService } from 'src/features/catalog/services/catalogService';

/**
 * useCategorias — categorías públicas para filtros del catálogo y la landing.
 * Capa: hook → service → axios (nunca llama axios directo). *(Layered + Observer)*
 *
 * Requiere que `catalogService` exponga `getCategorias()` apuntando a
 * `GET /inventory/public/categorias/` (ya lo tiene).
 *
 * `placeholderData: keepPreviousData` — durante cualquier refetch en segundo
 * plano mantiene la última lista de categorías en lugar de volver a `undefined`.
 * Sin esto, en cada refetch `categorias.data` quedaba vacío por un instante y la
 * sección "Categorías populares" se ocultaba sola (igual que pasaba con focus).
 *
 * Las categorías cambian poco: staleTime alto evita refetch innecesario.
 */
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias', 'public'],
    queryFn: () => catalogService.getCategorias(),
    staleTime: 1000 * 60 * 30, // 30 min
    placeholderData: keepPreviousData,
  });
}
