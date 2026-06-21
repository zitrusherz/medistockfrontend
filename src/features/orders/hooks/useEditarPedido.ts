// features/orders/hooks/useEditarPedido.ts
// T2.10 — Mutación de edición (Command). Solo se invoca cuando el pedido está PENDIENTE
// (la página decide habilitar/deshabilitar la edición según estado: patrón State).
//
// Tras éxito:
//   · invalida ['pedidos','mis']        → la lista refleja el cambio.
//   · invalida ['pedidos','detalle',id] → el detalle se revalida.
//   · setQueryData del detalle          → respuesta del PATCH ya viene mapeada a Pedido,
//                                          se siembra para evitar parpadeo.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { EditarPedido } from '../types';

export function useEditarPedido(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: EditarPedido) => orderService.editarPedido(id, payload),
        onSuccess: (pedido) => {
            qc.setQueryData(['pedidos', 'detalle', id], pedido);
            qc.invalidateQueries({ queryKey: ['pedidos', 'mis'] });
            qc.invalidateQueries({ queryKey: ['pedidos', 'detalle', id] });
        },
    });
}
