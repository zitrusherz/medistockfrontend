

import type { PaymentStrategy, IniciarResult, CommitResult } from './PaymentStrategy';
import type { Pago } from '@/types/models';

const nowISO = () => new Date().toISOString();

export const mockPaymentStrategy: PaymentStrategy = {
    iniciar: async (pedidoId) => {
        const token = `mock_${pedidoId}_${Date.now()}`;
        const returnUrl = `${window.location.origin}/cliente/pago/retorno`;
        return {
            transaccionId: Math.floor(Math.random() * 100000),
            pedidoId,
            amount: 99900,
            token,
            url: returnUrl,
            redirectUrl: `${returnUrl}?token_ws=${token}`,
            yaIniciada: false,
        } satisfies IniciarResult;
    },

    commit: async (tokenWs) => ({
        transaccionId: 0,
        pedidoId: 0,
        aprobada: true,
        estadoPago: 'CONFIRMADO',
        estadoPedido: 'APROBADO',
        webpayStatus: 'AUTHORIZED',
        responseCode: 0,
        despachoCreado: true,
        _token: tokenWs, // no usado; solo evita warning
    }) as CommitResult,

    consultar: async (_tokenWs): Promise<Pago> => ({
        id: 0,
        pedidoId: 0,
        pedidoTotal: 99900,
        metodoPago: 'WEBPAY',
        estadoPago: 'CONFIRMADO',
        montoConfirmado: 99900,
        buyOrder: 'MOCK-ORDER',
        authorizationCode: 'MOCK-0000',
        cardLastDigits: '1234',
        paymentTypeCode: 'VD',
        webpayStatus: 'AUTHORIZED',
        responseCode: 0,
        transactionDate: nowISO(),
        fechaCreacion: nowISO(),
        fechaConfirmacion: nowISO(),
        observacion: 'Pago mock confirmado.',
    }),
};