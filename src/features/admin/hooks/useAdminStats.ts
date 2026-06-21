// features/admin/hooks/useAdminStats.ts
// T4.1 — Fuente de datos de la página Estadísticas. Compone tres queries que
// OTRAS vistas ya cachean (useTodosPedidos, usePagos, useClientes): React Query
// deduplica, así que esto NO añade red. Toda la analítica sale de los selectores
// puros (adminStats.ts), memorizada. (Observer vía React Query + Adapter.)

import { useMemo } from 'react';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import { usePagos } from '@/features/payments/hooks/usePagos';
import { useClientes } from '@/features/accounts/hooks/useClientes';
import {
    adminKpis,
    ventasMensuales,
    ventasPorTipoVenta,
    topCompradores,
    pedidosRecientes,
} from '../selectors/adminStats';

export function useAdminStats() {
    const pedidosQ = useTodosPedidos();
    const pagosQ = usePagos();
    const clientesQ = useClientes();

    const { pedidos } = pedidosQ;
    const { pagos } = pagosQ;
    const { clientes } = clientesQ;

    const isLoading = pedidosQ.isLoading || pagosQ.isLoading || clientesQ.isLoading;
    const isError = pedidosQ.isError || pagosQ.isError || clientesQ.isError;

    const derivados = useMemo(
        () => ({
            kpis: adminKpis(pedidos, pagos, clientes),
            serieMensual: ventasMensuales(pagos),
            ventasPorTipo: ventasPorTipoVenta(pagos, pedidos),
            ranking: topCompradores(pedidos),
            recientes: pedidosRecientes(pedidos),
        }),
        [pedidos, pagos, clientes],
    );

    function refetch() {
        // useClientes no expone refetch; React Query revalida solo por staleTime.
        pedidosQ.refetch();
        pagosQ.refetch();
    }

    return { ...derivados, pedidos, pagos, clientes, isLoading, isError, refetch };
}
