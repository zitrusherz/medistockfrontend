// features/orders/hooks/useAccionesPedido.ts
// T3.2 — Command sobre pedidos: aprobar / rechazar (Ejecutivo/Admin).
//
// Cada acción es una mutación de React Query que invalida ['pedidos','todos']
// SOLO en onSuccess. Un 409 (el stock cambió entre la compra y la aprobación)
// sube como ApiError desde el interceptor de lib/axios: se traduce con
// notifyApiError y NO se invalida nada, así el pedido sigue mostrándose como
// PENDIENTE (no se finge un cambio que el backend rechazó).
//
// `aprobar.variables` / `rechazar.variables` exponen el último id disparado:
// la página lo usa para mostrar el spinner solo en la fila correspondiente.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { notifyApiError } from '@/utils/notifyApiError';
import { useToast } from '@/components/ui';
import type { ApiError } from '@/lib/axios';

type AprobarVars = { id: string | number; comentario?: string };
type RechazarVars = { id: string | number; comentario: string };

export function useAccionesPedido() {
    const qc = useQueryClient();
    // notifyApiError exige (error, toast): el toast sale del contexto del kit.
    const { toast } = useToast();

    const invalidar = () =>
        qc.invalidateQueries({ queryKey: ['pedidos', 'todos'] });

    const aprobar = useMutation({
        mutationFn: ({ id, comentario }: AprobarVars) =>
            orderService.aprobar(id, comentario),
        onSuccess: invalidar,
        onError: (e: ApiError) => notifyApiError(e, toast), // 409 → mensaje claro
    });

    const rechazar = useMutation({
        mutationFn: ({ id, comentario }: RechazarVars) =>
            orderService.rechazar(id, comentario),
        onSuccess: invalidar,
        onError: (e: ApiError) => notifyApiError(e, toast),
    });

    return { aprobar, rechazar };
}