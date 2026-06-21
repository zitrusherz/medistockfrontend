// src/features/inventory/hooks/useProductosAdmin.ts
// Custom Hook + Observer (React Query). Lista de productos para la tabla del
// admin (T4.2). Reusa /inventory/catalogo/ vía inventoryService, así que trae
// stock y precio con IVA ya mapeados a dominio (Product).
//
// queryKey ['productos','admin']: al crear un producto invalidamos ['productos']
// y ['catalogo'], por lo que esta tabla y el catálogo público se refrescan solos.

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useProductosAdmin() {
    const query = useQuery({
        queryKey: ['productos', 'admin'],
        queryFn: () => inventoryService.getProductosCatalogo({}),
        staleTime: 60_000,
    });

    return {
        productos: query.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
