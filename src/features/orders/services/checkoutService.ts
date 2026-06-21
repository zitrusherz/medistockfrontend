// src/features/orders/services/checkoutService.ts
// T2.8 ⭐ — FACADE del checkout + BUILDER del pedido.
// T2.9 ⭐ — Se extiende el FACADE con `pagar`: única cara para "convertir el
//           carrito en pedido" y luego "cobrar ese pedido".
//
// Facade: una sola cara para "convertir el carrito en pedido". La página/form no
// conoce el cartStore ni el orderService; sólo pasa los datos de entrega.
// Builder: buildPedido() arma el payload NuevoPedido (snake_case de la API) a
// partir del estado del carrito (sucursal + detalles) y los datos del checkout.
//
// Capas: page → CheckoutForm → checkoutService → orderService → lib/axios.
// El form NUNCA llama a axios ni al store directamente para crear el pedido.

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
    despacho: TipoDespacho;
    prioridad: PrioridadMedica;
    observacion?: string;
}

/* -------------------------------------------------------------------------- */
/*  BUILDER — form plano + carrito  →  payload NuevoPedido (snake_case)        */
/* -------------------------------------------------------------------------- */

/**
 * Arma POST /orders/pedidos/.
 *  - sucursal_origen_id y detalles[] salen del carrito (Singleton del store).
 *  - tipo_venta fijo 'WEBPAY' (flujo B2C de paciente particular).
 *  - observacion vacía → undefined (no ensuciar el payload).
 *
 * Lanza si el carrito no tiene sucursal o está vacío: el form debe impedir
 * llegar aquí, pero validamos por contrato.
 */
export const buildPedido = (input: CheckoutInput): NuevoPedido => {
    const sucursalId = cartImperative.getSucursalId();
    const detalles = cartImperative.toDetalles();

    if (sucursalId == null) {
        throw new Error('El carrito no tiene una sucursal asociada.');
    }
    if (detalles.length === 0) {
        throw new Error('El carrito está vacío.');
    }

    return {
        sucursal_origen_id: sucursalId,
        direccion_entrega_id: input.direccionId,
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
    /**
     * Crea el pedido desde el carrito. Devuelve el Pedido con montos REALES
     * (monto_neto, monto_iva, total) calculados por el backend.
     * NO vacía el carrito: eso lo decide el llamador SOLO tras un 201 (onSuccess),
     * para que un 400/409 deje el carrito intacto.
     */
    crearDesdeCarrito: async (input: CheckoutInput): Promise<Pedido> => {
        const payload = buildPedido(input);
        return orderService.crearPedido(payload);
    },

    /**
     * T2.9 — Inicia el pago Webpay de un pedido YA creado. Delega en
     * paymentService (Strategy: Webpay real o mock según VITE_USE_MOCKS) y
     * devuelve a dónde redirigir (IniciarResult). La página /cliente/pago/:id
     * no necesita conocer los endpoints ni la estrategia: sólo pide "pagar".
     */
    pagar: (pedidoId: number) => paymentService.iniciarPago(pedidoId),

    /** Vaciar carrito tras pago/creación confirmada. */
    limpiarCarrito: (): void => cartImperative.clear(),
};
