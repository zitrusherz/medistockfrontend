// src/features/logistics/hooks/useEnvios.ts
// T3.5 — Command sobre envíos (cotizar / crear / actualizar estado).
// Espejo de useAccionesPedido: cada acción es una mutación de React Query que
// invalida lo justo en onSuccess y traduce el error con notifyApiError.
//
// 502 (courier no responde) sube como ApiError desde lib/axios; notifyApiError lo
// muestra como "servicio externo no responde, reintenta" SIN invalidar nada, así
// no se finge un cambio que el courier rechazó. Crear envío NO se reintenta solo:
// el operador decide reintentar (evita envíos duplicados).

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logisticsService } from '../services/logisticsService';
import { estadoEnvioConfig } from '../services/envioState';
import { notifyApiError } from '@/utils/notifyApiError';
import { useToast } from '@/components/ui';
import type { ApiError } from '@/lib/axios';
import type {
    ActualizarEstadoDespachoRequest,
    CotizarEnvioRequest,
    CrearEnvioRequest,
} from '../types';

/** Cotiza costo + servicios disponibles para un destino. */
export function useCotizarEnvio() {
    const { toast } = useToast();
    return useMutation({
        mutationFn: (req: CotizarEnvioRequest) => logisticsService.cotizar(req),
        onError: (e: ApiError) => notifyApiError(e, toast),
    });
}

/** Crea el envío: genera el nº de seguimiento que alimenta el tracking (T2.11). */
export function useCrearEnvio() {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (req: CrearEnvioRequest) => logisticsService.crearEnvio(req),
        onSuccess: (despacho) => {
            // El backend movió el estado del pedido al crear el envío → refrescar cola.
            qc.invalidateQueries({ queryKey: ['pedidos', 'todos'] });
            qc.invalidateQueries({
                queryKey: ['tracking', String(despacho.pedido_id)],
            });
            toast({
                title: 'Envío creado',
                description: `Seguimiento ${despacho.numero_seguimiento}`,
                variant: 'default',
            });
        },
        onError: (e: ApiError) => notifyApiError(e, toast), // 502 → courier no responde
    });
}

/** Avanza manualmente el estado del despacho (RETIRADO/EN_TRANSITO/ENTREGADO/…). */
export function useActualizarEstadoEnvio(pedidoId: number | string) {
    const qc = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload: ActualizarEstadoDespachoRequest) =>
            logisticsService.actualizarEstado(pedidoId, payload),
        onSuccess: (despacho) => {
            qc.invalidateQueries({ queryKey: ['tracking', String(pedidoId)] });
            qc.invalidateQueries({ queryKey: ['pedidos', 'todos'] });
            toast({
                title: 'Estado actualizado',
                description: estadoEnvioConfig(despacho.estado_envio).label,
                variant: 'default',
            });
        },
        onError: (e: ApiError) => notifyApiError(e, toast),
    });
}
