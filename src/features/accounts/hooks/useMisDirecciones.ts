// src/features/accounts/hooks/useMisDirecciones.ts
// T2.8 — Direcciones de entrega del cliente (Observer vía React Query).
// Consumido por el CheckoutForm para elegir destino del despacho.

import { useQuery } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';

export function useMisDirecciones() {
    return useQuery({
        queryKey: ['accounts', 'mis-direcciones'],
        queryFn: () => accountsService.getMisDirecciones(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
