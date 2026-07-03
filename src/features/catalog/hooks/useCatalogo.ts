

import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';
import type { CatalogoFiltros } from '../types';

export function useCatalogo(filtros: CatalogoFiltros = {}) {
    const { search, categoria_id, marca_id, sucursal_id } = filtros;


    const serverFiltros = { categoria_id, marca_id, sucursal_id };

    const query = useQuery({
        queryKey: ['catalogo', serverFiltros],
        queryFn: () => catalogService.getCatalogo(serverFiltros),

        placeholderData: keepPreviousData,
        staleTime: 60_000,
    });


    const filtrados = useMemo(() => {
        const productos = query.data ?? [];
        const q = search?.trim().toLowerCase();
        if (!q) return productos;
        return productos.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q),
        );
    }, [query.data, search]);

    return {
        productos: filtrados,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isEmpty: !query.isLoading && filtrados.length === 0,
        isError: query.isError,
        error: query.error,
    };
}