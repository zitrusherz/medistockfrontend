

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';

export function useClientes(search?: string) {
    const query = useQuery({
        queryKey: ['clientes', 'lista'],
        queryFn: () => accountsService.clientes(),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const clientes = useMemo(() => {
        const todos = query.data ?? [];
        const q = search?.trim().toLowerCase();
        if (!q) return todos;
        return todos.filter(
            (c) =>
                c.nombre.toLowerCase().includes(q) ||
                c.rut.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q),
        );
    }, [query.data, search]);

    return {
        clientes,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isEmpty: !query.isLoading && clientes.length === 0,
        isError: query.isError,
        error: query.error,
    };
}
