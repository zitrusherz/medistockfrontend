// src/features/logistics/hooks/useTracking.ts
// Custom Hook + Observer (React Query) — T2.11. Espejo de useCatalogo.ts.
//
// Reglas de la spec:
//   · Polling suave: refetch cada ~30s SOLO mientras estado_envio === 'EN_TRANSITO'.
//   · 404 (sin despacho) NO es error rojo: se expone como `sinDespacho` (estado
//     controlado) y NO se reintenta.
//   · 502 (courier no responde) se expone como `courierCaido` y ofrece reintento.

import { useQuery } from '@tanstack/react-query';
import { logisticsService } from '../services/logisticsService';
import { esEnTransito } from '../services/envioState';
import type { EnvioTracking } from '../services/mappers/trackingMapper';
import type { ApiError } from '@/lib/axios';

export function useTracking(pedidoId: number | string | undefined) {
    const id = pedidoId != null ? String(pedidoId) : '';

    const query = useQuery<EnvioTracking, ApiError>({
        queryKey: ['tracking', id],
        queryFn: () => logisticsService.getTracking(id),
        enabled: id !== '',
        staleTime: 15_000,
        // 404 = no hay despacho aún: no insistir. El resto, 1 reintento.
        retry: (failureCount, error) => {
            if (error?.status === 404) return false;
            return failureCount < 1;
        },
        // Polling suave solo en tránsito; en cualquier otro estado, se apaga.
        refetchInterval: (q) => {
            const data = q.state.data;
            return data && esEnTransito(data.estadoEnvio) ? 30_000 : false;
        },
    });

    const error = (query.error ?? null) as ApiError | null;
    const sinDespacho = error?.status === 404;
    const courierCaido = error?.status === 502;

    return {
        tracking: query.data ?? null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        // 404 no cuenta como error "duro": es un estado controlado de la UI.
        isError: query.isError && !sinDespacho,
        sinDespacho,
        courierCaido,
        error,
        refetch: query.refetch,
    };
}
