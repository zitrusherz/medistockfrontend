

import { orderService } from './orderService';
import { paymentService } from '@/features/payments/services/paymentService';
import { cartImperative } from '@/features/cart/hooks/useCart';
import type { Pedido } from '@/types/models';
import type {
    NuevoPedido,
    TipoDespacho,
    PrioridadMedica,
} from '../types';

/** Datos que el formulario de checkout aporta (lo que NO está en el carrito). */
export interface CheckoutInput {
    direccionId: number;
    /** Sucursal de origen del despacho (requerida por el backend). */
    sucursalId: number;
    despacho: TipoDespacho;
    prioridad: PrioridadMedica;
    observacion?: string;
}

/* -------------------------------------------------------------------------- */
/*  BUILDER — form plano + carrito  →  payload NuevoPedido (snake_case)        */
/* -------------------------------------------------------------------------- */


export const buildPedido = (input: CheckoutInput): NuevoPedido => {
    const detalles = cartImperative.toDetalles();

    if (detalles.length === 0) {
        throw new Error('El carrito está vacío.');
    }

    return {
        direccion_entrega_id: input.direccionId,
        sucursal_origen_id: input.sucursalId,
        tipo_venta: 'WEBPAY',
        tipo_despacho: input.despacho,
        prioridad_medica: input.prioridad,
        observacion: input.observacion?.trim() || undefined,
        detalles,
    };
};

/* -------------------------------------------------------------------------- */
/*  FACADE                                                                     */
/* -------------------------------------------------------------------------- */

export const checkoutService = {

    crearDesdeCarrito: async (input: CheckoutInput): Promise<Pedido> => {
        const payload = buildPedido(input);
        return orderService.crearPedido(payload);
    },


    pagar: (pedidoId: number) => paymentService.iniciarPago(pedidoId),

    /** Vaciar carrito tras pago/creación confirmada. */
    limpiarCarrito: (): void => cartImperative.clear(),
};
