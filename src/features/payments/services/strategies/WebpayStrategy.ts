// features/payments/services/strategies/WebpayStrategy.ts
// Implementacion real. Pega a endpoints Transbank del backend.

import  api  from '@/lib/axios';
import type { PaymentStrategy, IniciarResult, CommitResult } from './PaymentStrategy';
import type {
    IniciarPagoWebpayResponse,
    IniciarPagoWebpayExistenteResponse,
    CommitWebpayResponse,
    EstadoWebpayResponse,
} from '../../types';
import { toPago } from '../mappers/paymentMapper';

/** Distingue las 2 formas de respuesta de iniciar (201 nueva vs 200 existente). */
const esExistente = (
    d: IniciarPagoWebpayResponse | IniciarPagoWebpayExistenteResponse,
): d is IniciarPagoWebpayExistenteResponse =>
    (d as IniciarPagoWebpayExistenteResponse).transaccion_pago !== undefined;

export const webpayStrategy: PaymentStrategy = {
    iniciar: async (pedidoId) => {
        const { data } = await api.post<
        IniciarPagoWebpayResponse | IniciarPagoWebpayExistenteResponse
        >('/payments/webpay/iniciar/', { pedido_id: pedidoId });

        // Caso 200: ya habia transaccion. Reconstruir desde transaccion_pago.
        if (esExistente(data)) {
            const t = data.transaccion_pago;
            if (!t.token_ws) throw new Error("Transacción existente no tiene token_ws.");
            const token = t.token_ws;
            return {
                transaccionId: t.id,
                pedidoId: t.pedido_id,
                amount: t.monto_confirmado || t.pedido_total || 0,
                token,
                url: '',
                // sin url fresca; el front re-inicia o reconsulta estado
                redirectUrl: '',
                yaIniciada: true,
            } satisfies IniciarResult;
        }

        // Caso 201: transaccion nueva.
        return {
            transaccionId: data.transaccion_pago_id,
            pedidoId: data.pedido_id,
            amount: data.amount,
            token: data.token,
            url: data.url,
            redirectUrl: data.redirect_url,
            yaIniciada: false,
        } satisfies IniciarResult;
    },

    commit: async (tokenWs) => {
        const { data } = await api.post<CommitWebpayResponse>(
            '/payments/webpay/commit/',
            { token_ws: tokenWs },
        );
        return {
            transaccionId: data.transaccion_pago_id,
            pedidoId: data.pedido_id,
            aprobada: data.aprobada,
            estadoPago: data.estado_pago,
            estadoPedido: data.estado_pedido,
            webpayStatus: data.webpay.status,
            responseCode: data.webpay.response_code,
            despachoCreado: data.despacho?.creado ?? false,
        } satisfies CommitResult;
    },

    consultar: async (tokenWs) => {
        const { data } = await api.get<EstadoWebpayResponse>(
            `/payments/webpay/estado/${tokenWs}/`,
        );
        // estado trae transaccion FULL con card + authCode -> mapear a Pago
        return toPago(data.transaccion_pago);
    },
};