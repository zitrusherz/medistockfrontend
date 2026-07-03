

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
