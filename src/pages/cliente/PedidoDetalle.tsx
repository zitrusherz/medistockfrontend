

import { type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Spinner } from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import type { Pedido, EstadoPedido } from '@/types/models';

import { orderService, puedePagarPedido } from '@/features/orders/services/orderService';
import { useTracking } from '@/features/logistics/hooks/useTracking';
import { Timeline } from '@/features/logistics/components/Timeline';

/** Color del chip de estado del pedido (paleta del tema). */
const ESTADO_PEDIDO_CHIP: Record<EstadoPedido, string> = {
    PENDIENTE: 'bg-amber-50 text-amber-700',
    APROBADO: 'bg-emerald-50 text-emerald-700',
    RECHAZADO: 'bg-rose-50 text-rose-700',
    EN_PICKING: 'bg-grape-50 text-grape-700',
    DESPACHADO: 'bg-grape-50 text-azure-700',
    ENTREGADO: 'bg-emerald-50 text-emerald-700',
    CANCELADO: 'bg-rose-50 text-rose-700',
};

export default function PedidoDetalle() {
    const { id } = useParams<{ id: string }>();

    const pedidoQuery = useQuery<Pedido>({
        queryKey: ['pedido', id],
        queryFn: () => orderService.detallePedido(id as string),
        enabled: !!id,
    });

    const {
        tracking,
        isLoading: trackingLoading,
        isError: trackingError,
        sinDespacho,
        courierCaido,
        refetch,
    } = useTracking(id);

    /* ── Pedido: loading / error ──────────────────────────────────────────────── */
    if (pedidoQuery.isLoading) {
        return (
            <Centro>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            </Centro>
        );
    }

    if (pedidoQuery.isError || !pedidoQuery.data) {
        return (
            <Centro>
                <Aviso
                    tono="danger"
                    titulo="No pudimos cargar el pedido"
                    texto="Revisa el enlace o vuelve a tus pedidos."
                >
                    <Link
                        to="/cliente/pedidos"
                        className="text-[14px] font-semibold text-azure-600 hover:text-plum-700"
                    >
                        Ver mis pedidos
                    </Link>
                </Aviso>
            </Centro>
        );
    }

    const pedido = pedidoQuery.data;
    // En un 200 sin estado reconocible, el flujo arranca en PENDIENTE.
    const estadoEnvio = tracking?.estadoEnvio ?? 'PENDIENTE';

    return (
        <Centro>
            {/* Breadcrumb */}
            <nav className="mb-4 text-[13px] text-grape-500">
                <Link to="/cliente/pedidos" className="hover:text-plum-700">
                    Mis pedidos
                </Link>
                <span className="mx-1.5">/</span>
                <span className="text-ink">Pedido #{pedido.id}</span>
            </nav>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
                {/* ── Resumen del pedido ─────────────────────────────────────────── */}
                <section className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden self-start">
                    <div className="h-1.5 gold-rule" />
                    <div className="px-6 py-7 sm:px-8">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <h1 className="font-display font-bold text-plum-700 text-[24px]">
                                Pedido #{pedido.id}
                            </h1>
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-semibold ${
                                    ESTADO_PEDIDO_CHIP[pedido.estado] ?? 'bg-grape-50 text-grape-700'
                                }`}
                            >
                                {pedido.estado}
                            </span>
                        </div>

                        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                            <Dato etiqueta="Fecha" valor={formatDateTime(pedido.fechaCreacion) || '—'} />
                            <Dato etiqueta="Sucursal" valor={pedido.sucursalNombre || '—'} />
                            <Dato etiqueta="Despacho" valor={pedido.tipoDespacho} />
                            <Dato etiqueta="Prioridad" valor={pedido.prioridad} />
                        </dl>

                        {/* Líneas */}
                        <div className="mt-6 border-t border-grape-100 pt-5">
                            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-grape-500">
                                Productos
                            </h2>
                            <ul className="mt-3 space-y-2">
                                {pedido.detalles.map((d) => (
                                    <li
                                        key={d.id}
                                        className="flex items-start justify-between gap-3 text-[13.5px]"
                                    >
                                        <span className="text-ink">
                                            <span className="font-semibold">{d.cantidad}×</span>{' '}
                                            {d.productoNombre}
                                        </span>
                                        <span className="shrink-0 font-medium text-ink">
                                            {formatCLP(d.subtotal)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Totales */}
                        <div className="mt-5 space-y-1.5 border-t border-grape-100 pt-4 text-[13.5px]">
                            <Fila etiqueta="Neto" valor={formatCLP(pedido.montoNeto)} />
                            <Fila etiqueta="IVA (19%)" valor={formatCLP(pedido.montoIva)} />
                            <Fila
                                etiqueta="Total"
                                valor={formatCLP(pedido.total)}
                                fuerte
                            />
                        </div>

                        {/* Pago: si el pedido sigue impago (PENDIENTE + WEBPAY),
                            se ofrece iniciar/reintentar el cobro Webpay. */}
                        {puedePagarPedido(pedido) && (
                            <div className="mt-6 border-t border-grape-100 pt-5">
                                <Link
                                    to={`/cliente/pago/${pedido.id}`}
                                    className="block w-full rounded-lg bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 px-7 py-3 text-center text-[15px] font-extrabold text-plum-800 shadow-lift transition-colors"
                                >
                                    Pagar con Webpay
                                </Link>
                                <p className="mt-2 text-center text-[12.5px] text-grape-500">
                                    Tu pedido está pendiente de pago. Te llevaremos al
                                    portal seguro de Transbank.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Seguimiento ────────────────────────────────────────────────── */}
                <div className="self-start">{renderTracking()}</div>
            </div>
        </Centro>
    );

    /* ── Render del bloque de tracking (estados controlados) ──────────────────── */
    function renderTracking(): ReactNode {
        if (trackingLoading) {
            return (
                <CajaSimple>
                    <div className="flex items-center gap-3 text-[14px] text-grape-600">
                        <Spinner size="sm" />
                        Cargando seguimiento…
                    </div>
                </CajaSimple>
            );
        }

        // 404 → estado controlado, no error rojo.
        if (sinDespacho) {
            return (
                <Aviso
                    tono="info"
                    titulo="Aún sin despacho"
                    texto="Tu pedido todavía no genera un envío. En cuanto logística lo despache, aquí verás el seguimiento en tiempo real."
                />
            );
        }

        // 502 → courier caído, ofrecer reintento.
        if (courierCaido) {
            return (
                <Aviso
                    tono="warning"
                    titulo="El courier no responde"
                    texto="No pudimos consultar el seguimiento en este momento."
                >
                    <BotonReintentar onClick={() => refetch()} />
                </Aviso>
            );
        }

        // Otro error de tracking.
        if (trackingError || !tracking) {
            return (
                <Aviso
                    tono="danger"
                    titulo="No pudimos cargar el seguimiento"
                    texto="Vuelve a intentarlo en unos segundos."
                >
                    <BotonReintentar onClick={() => refetch()} />
                </Aviso>
            );
        }

        return <Timeline estado={estadoEnvio} tracking={tracking} />;
    }
}

/* -------------------------------------------------------------------------- */
/*  Presentacionales locales                                                   */
/* -------------------------------------------------------------------------- */

function Centro({ children }: { children: ReactNode }) {
    return <main className="mx-auto max-w-[1040px] px-5 py-10">{children}</main>;
}

function CajaSimple({ children }: { children: ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
            <div className="h-1.5 gold-rule" />
            <div className="px-6 py-7 sm:px-8">{children}</div>
        </div>
    );
}

const AVISO_TONE = {
    info: { chip: 'text-azure-600', titulo: 'text-plum-700' },
    warning: { chip: 'text-amber-600', titulo: 'text-plum-700' },
    danger: { chip: 'text-rose-600', titulo: 'text-plum-700' },
} as const;

function Aviso({
    tono,
    titulo,
    texto,
    children,
}: {
    tono: keyof typeof AVISO_TONE;
    titulo: string;
    texto: string;
    children?: ReactNode;
}) {
    const t = AVISO_TONE[tono];
    return (
        <CajaSimple>
            <p className={`text-[13px] font-semibold uppercase tracking-wide ${t.chip}`}>
                Seguimiento
            </p>
            <h2 className={`mt-1 font-display font-bold text-[22px] ${t.titulo}`}>{titulo}</h2>
            <p className="mt-2 text-[14px] text-grape-600">{texto}</p>
            {children && <div className="mt-5">{children}</div>}
        </CajaSimple>
    );
}

function BotonReintentar({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[14px] px-6 py-2.5 rounded-lg shadow-lift transition-colors"
        >
            Reintentar
        </button>
    );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <div>
            <dt className="text-[12px] text-grape-500">{etiqueta}</dt>
            <dd className="text-[13.5px] font-semibold text-ink">{valor}</dd>
        </div>
    );
}

function Fila({
    etiqueta,
    valor,
    fuerte,
}: {
    etiqueta: string;
    valor: string;
    fuerte?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className={fuerte ? 'font-bold text-ink' : 'text-grape-600'}>{etiqueta}</span>
            <span className={fuerte ? 'font-bold text-plum-700 text-[15px]' : 'text-ink'}>
                {valor}
            </span>
        </div>
    );
}
