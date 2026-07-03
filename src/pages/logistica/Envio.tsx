

import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Select,
    Spinner,
} from '@/components/ui';
import { Timeline } from '@/features/logistics/components/Timeline';
import { useTracking } from '@/features/logistics/hooks/useTracking';
import { useComunasChilexpress } from '@/features/locations/hooks/useComunasChilexpress';
import {
    useCotizarEnvio,
    useCrearEnvio,
    useActualizarEstadoEnvio,
} from '@/features/logistics/hooks/useEnvios';
import { orderService } from '@/features/orders/services/orderService';
import { formatCLP } from '@/utils/formatCurrency';
import type { CotizacionResponse, NuevoEstadoEnvio } from '@/features/logistics/types';
import type { EstadoEnvio } from '@/types/models';

/** Estados a los que el operador puede transicionar manualmente el despacho. */
const ESTADOS_MANUALES: NuevoEstadoEnvio[] = [
    'RETIRADO',
    'EN_TRANSITO',
    'ENTREGADO',
    'DEVUELTO',
    'CANCELADO',
];

export default function LogisticaEnvio() {
    const { pedidoId = '' } = useParams();

    const pedidoQuery = useQuery({
        queryKey: ['pedido', pedidoId],
        queryFn: () => orderService.detallePedido(pedidoId),
        enabled: pedidoId !== '',
    });

    const {
        tracking,
        isLoading: cargandoTracking,
        sinDespacho,
        courierCaido,
        refetch,
    } = useTracking(pedidoId);

    const pedido = pedidoQuery.data;

    if (pedidoQuery.isLoading || cargandoTracking) {
        return (
            <PageWrapper size="lg">
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            </PageWrapper>
        );
    }

    if (!pedido) {
        return (
            <PageWrapper size="lg">
                <div className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
                    No se encontró el pedido #{pedidoId}.{' '}
                    <Link to="/logistica/ordenes" className="font-semibold underline">
                        Volver a órdenes
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    const yaTieneDespacho = !sinDespacho && tracking !== null;

    return (
        <PageWrapper size="xl">
            <PageHeader
                title={`Despacho · Pedido #${pedido.id}`}
                description={`${pedido.cliente} · ${pedido.sucursalNombre} · ${formatCLP(
                    pedido.total,
                )}`}
                breadcrumb={[
                    { label: 'Inicio', href: '/logistica' },
                    { label: 'Órdenes', href: '/logistica/ordenes' },
                    { label: `Despacho #${pedido.id}` },
                ]}
            />

            <div className="mt-6 space-y-6">
                {/* Courier caído (502): no podemos confirmar el envío → reintento. */}
                {courierCaido && (
                    <div className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
                        El courier no responde en este momento. No se puede confirmar
                        el estado del envío.
                        <Button
                            size="xs"
                            variant="ghost"
                            className="ml-3"
                            onClick={() => refetch()}
                        >
                            Reintentar
                        </Button>
                    </div>
                )}

                {/* Si NO hay despacho → flujo de creación. Si lo hay → gestión de estado. */}
                {!yaTieneDespacho && !courierCaido ? (
                    <CrearEnvioPanel pedidoId={pedido.id} />
                ) : yaTieneDespacho && tracking ? (
                    <GestionDespacho
                        pedidoId={pedido.id}
                        estado={tracking.estadoEnvio ?? 'PENDIENTE'}
                        tracking={tracking}
                    />
                ) : null}
            </div>
        </PageWrapper>
    );
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Panel 1 — Crear envío: validar comuna → cotizar → elegir servicio → crear    */
/* ──────────────────────────────────────────────────────────────────────────── */

function CrearEnvioPanel({ pedidoId }: { pedidoId: number }) {
    const { comunas, isLoading: cargandoComunas } = useComunasChilexpress();
    const cotizar = useCotizarEnvio();
    const crear = useCrearEnvio();

    const [comuna, setComuna] = useState('');
    const [servicio, setServicio] = useState('');
    const [cotizacion, setCotizacion] = useState<CotizacionResponse | null>(null);

    // Solo comunas con cobertura (retorna_respuesta !== false).
    const opcionesComuna = useMemo(
        () =>
            comunas
                .filter((c) => c.retorna_respuesta !== false)
                .map((c) => ({
                    value: c.county_code,
                    label: `${c.county_name} — ${c.coverage_name}`,
                })),
        [comunas],
    );

    const sinCobertura = !cargandoComunas && opcionesComuna.length === 0;

    function onCotizar() {
        setCotizacion(null);
        setServicio('');
        cotizar.mutate(
            { county_code_destino: comuna, pedido_id: pedidoId },
            { onSuccess: (data) => setCotizacion(data) },
        );
    }

    function onCrear() {
        crear.mutate({
            pedido_id: pedidoId,
            service_type_code: Number(servicio),
        });
    }

    return (
        <Card>
            <CardHeader>Generar envío</CardHeader>
            <CardBody>
                {sinCobertura ? (
                    <div className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                        No hay comunas con cobertura Chilexpress disponibles. No es
                        posible cotizar el envío.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* 1) Comuna de destino con cobertura */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="sm:w-96">
                                <Select
                                    label="Comuna de destino (con cobertura)"
                                    options={[
                                        { value: '', label: 'Selecciona una comuna…' },
                                        ...opcionesComuna,
                                    ]}
                                    value={comuna}
                                    disabled={cargandoComunas}
                                    onChange={(e) => {
                                        setComuna(e.target.value);
                                        setCotizacion(null);
                                        setServicio('');
                                    }}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                disabled={!comuna}
                                loading={cotizar.isPending}
                                onClick={onCotizar}
                            >
                                Cotizar
                            </Button>
                        </div>

                        {/* 2) Servicios cotizados */}
                        {cotizacion && (
                            <div className="space-y-3 border-t border-border pt-5">
                                {cotizacion.servicios_disponibles.length === 0 ? (
                                    <p className="text-sm text-text-muted">
                                        El courier no devolvió servicios para esta
                                        comuna. Prueba otra comuna de destino.
                                    </p>
                                ) : (
                                    <div className="sm:w-96">
                                        <Select
                                            label="Servicio de envío"
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Selecciona un servicio…',
                                                },
                                                ...cotizacion.servicios_disponibles.map(
                                                    (s) => ({
                                                        value: String(s.serviceTypeCode),
                                                        label: `${s.serviceDescription} — ${formatCLP(
                                                            Number(s.serviceValue),
                                                        )}`,
                                                    }),
                                                ),
                                            ]}
                                            value={servicio}
                                            onChange={(e) => setServicio(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardBody>

            <CardFooter>
                <div className="flex w-full justify-end gap-2">
                    <Button
                        variant="primary"
                        disabled={!servicio || sinCobertura}
                        loading={crear.isPending}
                        onClick={onCrear}
                    >
                        Crear envío
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Panel 2 — Despacho existente: Timeline + avanzar estado                      */
/* ──────────────────────────────────────────────────────────────────────────── */

function GestionDespacho({
    pedidoId,
    estado,
    tracking,
}: {
    pedidoId: number;
    estado: EstadoEnvio;
    tracking: NonNullable<ReturnType<typeof useTracking>['tracking']>;
}) {
    const actualizar = useActualizarEstadoEnvio(pedidoId);
    const [nuevoEstado, setNuevoEstado] = useState<NuevoEstadoEnvio | ''>('');

    function onActualizar() {
        if (!nuevoEstado) return;
        actualizar.mutate(
            { nuevo_estado: nuevoEstado },
            { onSuccess: () => setNuevoEstado('') },
        );
    }

    return (
        <div className="space-y-6">
            {/* El cliente ve exactamente este Timeline (T2.11). */}
            <Timeline estado={estado} tracking={tracking} />

            <Card>
                <CardHeader>Actualizar estado del despacho</CardHeader>
                <CardBody>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="sm:w-72">
                            <Select
                                label="Nuevo estado"
                                options={[
                                    { value: '', label: 'Selecciona…' },
                                    ...ESTADOS_MANUALES.map((e) => ({
                                        value: e,
                                        label: e.replace('_', ' '),
                                    })),
                                ]}
                                value={nuevoEstado}
                                onChange={(e) =>
                                    setNuevoEstado(e.target.value as NuevoEstadoEnvio | '')
                                }
                            />
                        </div>
                        <Button
                            variant="primary"
                            disabled={!nuevoEstado}
                            loading={actualizar.isPending}
                            onClick={onActualizar}
                        >
                            Actualizar
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
