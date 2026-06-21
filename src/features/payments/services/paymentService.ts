// features/payments/services/paymentService.ts
// Repository + Facade. Pago via Strategy. Listados via api directo.

import  api  from '@/lib/axios';
import { getPaymentStrategy } from './strategies';
import { toPago, toPagoEnriquecido } from './mappers/paymentMapper';
import type { Pago } from '@/types/models';
import type { TransaccionPago, PagoEnriquecido, TodosPagosFilters } from '../types';

const unwrap = <T>(d: { results?: T[] } | T[]): T[] =>
    Array.isArray(d) ? d : (d.results ?? []);

export const paymentService = {
    // --- flujo pago (Strategy) ---
    iniciarPago:   (pedidoId: number) => getPaymentStrategy().iniciar(pedidoId),
    commitPago:    (tokenWs: string)  => getPaymentStrategy().commit(tokenWs),
    consultarPago: (tokenWs: string)  => getPaymentStrategy().consultar(tokenWs),

    // --- listados (Repository) ---
    misPagos: async (): Promise<Pago[]> => {
        const { data } = await api.get('/payments/mis-pagos/');
        return unwrap<TransaccionPago>(data).map(toPago);
    },

    todosPagos: async (filtros?: TodosPagosFilters): Promise<Pago[]> => {
        const { data } = await api.get('/payments/todos/', { params: filtros });
        return unwrap<PagoEnriquecido>(data).map(toPagoEnriquecido);
    },
};