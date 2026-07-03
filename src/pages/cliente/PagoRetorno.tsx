

import { useEffect, type ReactNode } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router';
import { formatCLP } from '@/utils/formatCurrency';
import { limpiarPagoPendiente } from '@/features/payments/services/pagoSession';

/** Estilos por familia semántica (colores de tu sistema de diseño original). */
const TONE = {
    success: { wrap: 'bg-emerald-50 text-emerald-700', badge: 'text-emerald-600' },
    danger: { wrap: 'bg-rose-50 text-rose-700', badge: 'text-rose-600' },
};

export default function PagoRetorno() {
    const [params] = useSearchParams();

    // Captura de los estados limpios devueltos por el redirect 302 de Django
    const estadoRaw = params.get('estado'); // 'CONFIRMADO' o 'RECHAZADO'
    const pedidoId = params.get('pedido_id');
    const transaccionId = params.get('transaccion_id');
    const montoRaw = params.get('monto'); // Opcional si tu backend lo envía en la URL

    // Limpieza defensiva del estado efímero del pago al montar el componente
    useEffect(() => {
        limpiarPagoPendiente();
    }, []);

    // Guard de seguridad: si se accede de forma directa sin parámetros, se evacúa al home
    if (!estadoRaw || !pedidoId) {
        return <Navigate to="/" replace />;
    }

    const aprobado = estadoRaw === 'CONFIRMADO' || estadoRaw === 'AUTORIZADO';
    const tone = aprobado ? TONE.success : TONE.danger;

    const tituloBadge = aprobado ? 'Aprobado' : 'Rechazado';
    const tituloPrincipal = aprobado ? '¡Listo! Tu pago fue aprobado' : 'El pago ha sido rechazado';
    const mensaje = aprobado
        ? 'Tu transacción ha sido procesada correctamente y el pedido está confirmado.'
        : 'Hubo un problema al procesar el pago con Webpay o la sesión fue cancelada.';

    return (
        <Centro>
            <Tarjeta>
                <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-semibold ${tone.wrap}`}
                >
                    {tituloBadge}
                </span>

                <h1 className="mt-3 font-display font-bold text-plum-700 text-[30px]">
                    {tituloPrincipal}
                </h1>
                <p className="mt-2 text-[14px] text-grape-600">{mensaje}</p>

                {/* Comprobante limpio con datos validados de la URL */}
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-left max-w-md mx-auto bg-grape-50/50 p-4 rounded-xl border border-grape-100">
                    <Dato etiqueta="Orden de compra" valor={`PED-${pedidoId}`} />
                    <Dato etiqueta="Estado del pago" valor={estadoRaw} />
                    {transaccionId && (
                        <Dato etiqueta="N.º de Transacción" valor={transaccionId} />
                    )}
                    {montoRaw && (
                        <Dato etiqueta="Monto confirmado" valor={formatCLP(parseInt(montoRaw) || 0)} />
                    )}
                </dl>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {aprobado ? (
                        <>
                            <Link
                                to={`/cliente/pedidos/${pedidoId}`}
                                className="bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3 rounded-lg shadow-lift transition-colors"
                            >
                                Seguir mi pedido
                            </Link>
                            <Link
                                to="/cliente/pedidos"
                                className="self-center text-[14px] font-semibold text-azure-600 hover:text-plum-700"
                            >
                                Ver mis pedidos
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to={`/cliente/pago/${pedidoId}`}
                                className="bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3 rounded-lg shadow-lift transition-colors"
                            >
                                Reintentar pago
                            </Link>
                            <Link
                                to="/cliente/carrito"
                                className="self-center text-[14px] font-semibold text-azure-600 hover:text-plum-700"
                            >
                                Volver al carrito
                            </Link>
                        </>
                    )}
                </div>
            </Tarjeta>
        </Centro>
    );
}

/* -------------------------------------------------------------------------- */
/* Presentacionales locales preservados del diseño original                  */
/* -------------------------------------------------------------------------- */

function Centro({ children }: { children: ReactNode }) {
    return <main className="mx-auto max-w-[640px] px-5 py-16">{children}</main>;
}

function Tarjeta({ children }: { children: ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
            <div className="h-1.5 gold-rule" />
            <div className="px-6 py-10 sm:px-10 text-center">{children}</div>
        </div>
    );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <div>
            <dt className="text-[12px] text-grape-500">{etiqueta}</dt>
            <dd className="text-[14px] font-semibold text-ink break-all">{valor}</dd>
        </div>
    );
}