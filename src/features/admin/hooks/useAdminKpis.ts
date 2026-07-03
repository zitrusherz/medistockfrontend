

import { useMemo } from 'react';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import { usePagos } from '@/features/payments/hooks/usePagos';
import { useClientes } from '@/features/accounts/hooks/useClientes';
import {
    calcularCobranza,
    totalPorCobrarGlobal,
} from '@/features/payments/services/cobranza';
import { useCotizaciones } from './useCotizaciones';

export function useAdminKpis() {
    const pedidosQ = useTodosPedidos();
    const pagosQ = usePagos();
    const clientesQ = useClientes();
    const cotizaciones = useCotizaciones();

    const { pedidos } = pedidosQ;
    const { pagos } = pagosQ;
    const { clientes } = clientesQ;

    const isLoading = pedidosQ.isLoading || pagosQ.isLoading || clientesQ.isLoading;
    const isError = pedidosQ.isError || pagosQ.isError || clientesQ.isError;

    const kpis = useMemo(() => {
        const pendientes = pedidos.filter((p) => p.estado === 'PENDIENTE').length;
        const clientesActivos = clientes.filter((c) => c.activo).length;
        const cuentas = calcularCobranza(pagos, pedidos);
        return {
            pedidosPendientes: pendientes,
            clientesActivos,
            porCobrar: totalPorCobrarGlobal(cuentas),
            clientesMorosos: cuentas.length,
        };
    }, [pedidos, pagos, clientes]);

    function refetch() {
        pedidosQ.refetch();
        pagosQ.refetch();
    }

    return {
        ...kpis,
        cotizacionesPendientes: cotizaciones.pendientes,
        cotizacionesDisponible: cotizaciones.disponible,
        isLoading,
        isError,
        refetch,
    };
}
