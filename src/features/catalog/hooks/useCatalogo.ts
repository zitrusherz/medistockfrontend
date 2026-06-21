// features/catalog/hooks/useCatalogo.ts
// Custom Hook + Observer (React Query). Reparte el trabajo según el DoD de T2.3:
//   · Servidor: categoria_id / marca_id / sucursal_id  (forman la queryKey y refetch).
//   · Cliente:  texto (search)  →  el endpoint /catalogo/ NO recibe `search`,
//               así que filtrarlo aquí es lo correcto (no es un parche).
//
// Devuelve la MISMA interfaz que ya consume Catalogo.tsx:
//   { productos, isLoading, isEmpty, isFetching }  (+ isError/error por si los quieres).

import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';
import type { CatalogoFiltros } from '../types';

export function useCatalogo(filtros: CatalogoFiltros = {}) {
    const { search, categoria_id, marca_id, sucursal_id } = filtros;

    // Solo los filtros de servidor entran a la queryKey: cambiarlos dispara refetch.
    // El texto NO va aquí (se aplica en cliente) para no refetchear en cada tecla.
    const serverFiltros = { categoria_id, marca_id, sucursal_id };

    const query = useQuery({
        queryKey: ['catalogo', serverFiltros],
        queryFn: () => catalogService.getCatalogo(serverFiltros),
        // keepPreviousData (RQ v5): mantiene la lista anterior mientras llega la nueva
        // → al cambiar de sucursal/categoría no parpadea (mejora M12).
        placeholderData: keepPreviousData,
        staleTime: 60_000,
    });

    // Filtro de texto en cliente: nombre o código.
    // `productos` se deriva DENTRO del useMemo para no crear un ref nuevo en cada
    // render (regla react-hooks/exhaustive-deps); la dependencia real es query.data.
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