// src/features/cart/hooks/useCatalogLookup.ts
// T2.7 — Resolver un Product a partir del código (SKU) que el usuario teclea en QuickAdd.
//
// Por qué existe: cartStore.addItem necesita un Product COMPLETO (trae stockBySucursal
// para validar M3), pero el usuario sólo escribe un código. La API no expone "get by code"
// (getProducto es por id), así que reusamos el catálogo ya cacheado por React Query
// (Observer) y buscamos en memoria. Una sola descarga compartida; sin axios aquí (Layered).

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/features/catalog/services/catalogService';
import type { Product } from '@/types/models';

export const useCatalogLookup = () => {
    const { data: productos = [], isLoading } = useQuery({
        queryKey: ['catalogo', 'lookup'],
        queryFn: () => catalogService.getCatalogo({}),
        staleTime: 60_000,
    });

    const findByCode = useMemo(() => {
        const index = new Map(productos.map((p) => [p.code.toLowerCase(), p]));
        return (code: string): Product | undefined => index.get(code.trim().toLowerCase());
    }, [productos]);

    return { findByCode, productos, isLoading };
};
