// src/features/accounts/hooks/useClientePagos.ts
// T4.4 — Pagos de un cliente, para el tab "Pagos" del detalle (solo Admin).
//
// payments NO expone filtro por cliente (TodosPagosFilters = { estado_pago,
// metodo_pago }), así que NO se toca el feature de pagos: se trae todosPagos()
// y se filtra en front por clienteId. La queryKey es ['pagos','todos', null],
// LA MISMA que usePagos() sin filtros → React Query deduplica la red y comparte
// caché con el panel del Analista. (Observer + Repository, sin refetch extra.)
//
// Perezoso: enabled cuando el modal está abierto Y se pidieron pagos.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/features/payments/services/paymentService';

export function useClientePagos(clienteId?: number, enabled = false) {
    const query = useQuery({
        queryKey: ['pagos', 'todos', null], // comparte caché con usePagos()
        queryFn: () => paymentService.todosPagos(),
        enabled: enabled && clienteId != null,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    const pagos = useMemo(
        () => (query.data ?? []).filter((p) => p.clienteId === clienteId),
        [query.data, clienteId],
    );

    return {
        pagos,
        isLoading: query.isLoading,
        isEmpty: !query.isLoading && pagos.length === 0,
        isError: query.isError,
    };
}
