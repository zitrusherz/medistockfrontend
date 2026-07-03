

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Spinner } from '@/components/ui';
import type { ApiError } from '@/lib/axios';
import { checkoutService } from '@/features/orders/services/checkoutService';
import { guardarPagoPendiente } from '@/features/payments/services/pagoSession';

type Fase = 'iniciando' | 'redirigiendo' | 'error';

export default function Pago() {
    const { pedidoId } = useParams();
    const navigate = useNavigate();
    const id = Number(pedidoId);
    const idInvalido = !Number.isFinite(id) || id <= 0;
    const [fase, setFase] = useState<Fase>(idInvalido ? 'error' : 'iniciando');
    const [error, setError] = useState<string | null>(
        idInvalido ? 'No encontramos el pedido a pagar.' : null,
    );
    const yaCorrio = useRef(false);

    useEffect(() => {
        if (idInvalido) return;
        if (yaCorrio.current) return;
        yaCorrio.current = true;



        checkoutService
            .pagar(id)
            .then((res) => {

                guardarPagoPendiente({
                    token: res.token,
                    pedidoId: res.pedidoId,
                    transaccionId: res.transaccionId,
                });

                // Transacción nueva con URL fresca → formulario de Webpay.
                if (res.redirectUrl) {
                    setFase('redirigiendo');
                    window.location.assign(res.redirectUrl);
                    return;
                }


                if (res.token) {
                    navigate(
                        `/cliente/pago/retorno?token_ws=${encodeURIComponent(res.token)}`,
                        { replace: true },
                    );
                    return;
                }

                setError('No pudimos iniciar el pago. Intenta nuevamente.');
                setFase('error');
            })
            .catch((err) => {
                const e = err as ApiError;
                setError(
                    e.status === 502
                        ? 'Webpay no está respondiendo en este momento. Intenta en unos segundos.'
                        : e.message || 'No pudimos iniciar el pago de este pedido.',
                );
                setFase('error');
            });
    }, [id, idInvalido, navigate]);

    return (
        <main className="mx-auto max-w-[640px] px-5 py-16">
            <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
                <div className="h-1.5 gold-rule" />
                <div className="px-6 py-12 sm:px-10 text-center">
                    {fase === 'error' ? (
                        <>
                            <p className="text-[13px] font-semibold uppercase tracking-wide text-rose-600">
                                Pago no iniciado
                            </p>
                            <h1 className="mt-1 font-display font-bold text-plum-700 text-[28px]">
                                No pudimos llevarte a Webpay
                            </h1>
                            <p className="mt-2 text-[14px] text-grape-600">{error}</p>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                {Number.isFinite(id) && id > 0 && (
                                    <button
                                        onClick={() => window.location.assign(`/cliente/pago/${id}`)}
                                        className="bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3 rounded-lg shadow-lift transition-colors"
                                    >
                                        Reintentar pago
                                    </button>
                                )}
                                <Link
                                    to={Number.isFinite(id) && id > 0 ? `/cliente/pedidos/${id}` : '/cliente/pedidos'}
                                    className="self-center text-[14px] font-semibold text-azure-600 hover:text-plum-700"
                                >
                                    Ver mi pedido
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center">
                                <Spinner size="lg" />
                            </div>
                            <h1 className="mt-6 font-display font-bold text-plum-700 text-[26px]">
                                {fase === 'redirigiendo' ? 'Redirigiendo a Webpay…' : 'Preparando tu pago…'}
                            </h1>
                            <p className="mt-2 text-[14px] text-grape-600">
                                {fase === 'redirigiendo'
                                    ? 'Te estamos llevando al portal seguro de Transbank. No cierres esta ventana.'
                                    : 'Estamos iniciando la transacción del pedido.'}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
