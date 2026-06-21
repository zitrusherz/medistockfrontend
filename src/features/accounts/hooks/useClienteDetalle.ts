// features/accounts/hooks/useClienteDetalle.ts
// T3.3 — Detalle de un cliente. Query PEREZOSA: solo se dispara cuando el modal
// está abierto (enabled), así la página no precarga datos de todos los clientes.

import { useQuery } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';

export function useClienteDetalle(id?: string | number, enabled = false) {
    const query = useQuery({
        queryKey: ['clientes', 'detalle', id],
        queryFn: () => accountsService.cliente(id as string | number),
        enabled: enabled && id != null,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        cliente: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}
