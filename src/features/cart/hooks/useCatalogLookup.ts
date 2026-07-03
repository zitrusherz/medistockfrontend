

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
