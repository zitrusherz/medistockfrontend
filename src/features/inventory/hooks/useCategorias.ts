// src/features/inventory/hooks/useCategorias.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

/**
 * useCategorias (inventory) — categorías para los <select> del alta de producto (T4.2).
 * Capa: hook → service → axios (nunca llama axios directo). (Layered + Observer)
 *
 * OJO: este NO es el de catalog. Aquí usamos el endpoint ADMIN
 * `GET /inventory/categorias/` vía inventoryService.getCategorias(), que devuelve
 * TODAS las categorías (incluidas las internas tipo "cajas"). El de
 * `features/catalog/hooks/useCategorias` es el público y oculta cajas.
 *
 * queryKey ['inventory','categorias'] — distinto del público (['categorias','public'])
 * para que las dos cachés no se pisen.
 */
export function useCategorias() {
  return useQuery({
    queryKey: ['inventory', 'categorias'],
    queryFn: () => inventoryService.getCategorias(),
    staleTime: 1000 * 60 * 30, // 30 min
    placeholderData: keepPreviousData,
  });
}