

import type { EstadoPago } from '@/types/models';
import type { Pago } from '@/types/models';

/** Lo que devuelve iniciar: a donde mandar al usuario. */
export interface IniciarResult {
    transaccionId: number;
    pedidoId: number;
    amount: number;
    token: string;
    url: string;        // url base webpay
    redirectUrl: string; // url + token (a donde redirigir)
    yaIniciada: boolean; // true si API devolvio 200 (transaccion previa)
}

/** Lo que devuelve commit: resultado crudo de confirmacion. */
export interface CommitResult {
    transaccionId: number;
    pedidoId: number;
    aprobada: boolean;
    estadoPago: EstadoPago;
    estadoPedido: string;
    webpayStatus: string;
    responseCode: number;
    despachoCreado: boolean;
}

export interface PaymentStrategy {
    iniciar:   (pedidoId: number) => Promise<IniciarResult>;
    commit:    (tokenWs: string)  => Promise<CommitResult>;
    consultar: (tokenWs: string)  => Promise<Pago>; // estado -> Pago full (con card, authCode)
}