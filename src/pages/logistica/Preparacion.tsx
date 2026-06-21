// src/pages/logistica/Preparacion.tsx
// T3.5 — Hoja de picking del pedido (ruta contextual /logistica/preparacion/:pedidoId).
// Muestra las líneas del pedido y, por cada producto, los lotes disponibles
// ordenados FEFO (vence antes = sugerido por defecto).
//
// IMPORTANTE: el set de APIs de T3.5 no incluye un endpoint "confirmar
// preparación". Según orderService, el avance de estado del pedido lo dispara el
// backend al CREAR EL ENVÍO. Por eso aquí la confirmación es una COMPUERTA DE UI:
// valida que cada línea tenga lote y habilita el paso a Despacho. El estado se
// moverá al crear el envío en la pantalla siguiente.
//
// Patrón State (lectura del ciclo del pedido) + reutilización de primitivas ui.

import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Select,
    Spinner,
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@/components/ui';
import { orderService } from '@/features/orders/services/orderService';
import { useLotes } from '@/features/inventory/hooks/useLotes';
import { lotesFEFO, sugerirFEFO } from '@/features/inventory/services/fefo';
import { formatDate } from '@/utils/formatDate';

export default function LogisticaPreparacion() {
    const { pedidoId = '' } = useParams();
    const navigate = useNavigate();

    const pedidoQuery = useQuery({
        queryKey: ['pedido', pedidoId],
        queryFn: () => orderService.detallePedido(pedidoId),
        enabled: pedidoId !== '',
    });
    const { lotes, isLoading: cargandoLotes } = useLotes();

    // Lote elegido por línea (default = FEFO al renderizar).
    const [seleccion, setSeleccion] = useState<Record<number, string>>({});

    const pedido = pedidoQuery.data;

    // Listo para despachar: cada línea tiene al menos un lote disponible.
    const listo = useMemo(() => {
        if (!pedido) return false;
        return pedido.detalles.every(
            (d) => lotesFEFO(lotes, d.productoId).length > 0,
        );
    }, [pedido, lotes]);

    if (pedidoQuery.isLoading || cargandoLotes) {
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

    return (
        <PageWrapper size="xl">
            <PageHeader
                title={`Preparación · Pedido #${pedido.id}`}
                description={`${pedido.cliente} · ${pedido.sucursalNombre} · prioridad ${pedido.prioridad}`}
                breadcrumb={[
                    { label: 'Inicio', href: '/logistica' },
                    { label: 'Órdenes', href: '/logistica/ordenes' },
                    { label: `Preparación #${pedido.id}` },
                ]}
            />

            <div className="mt-6">
                <Card>
                    <CardBody>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableColumn>Producto</TableColumn>
                                    <TableColumn className="text-center">Cant.</TableColumn>
                                    <TableColumn>Lote (FEFO sugerido)</TableColumn>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pedido.detalles.map((d) => {
                                    const opciones = lotesFEFO(lotes, d.productoId);
                                    const fefo = sugerirFEFO(lotes, d.productoId);
                                    const value =
                                        seleccion[d.id] ??
                                        (fefo ? String(fefo.id) : '');

                                    return (
                                        <TableRow key={d.id}>
                                            <TableCell>
                                                <span className="font-medium text-text">
                                                    {d.productoNombre}
                                                </span>
                                                <span className="ml-2 font-mono text-xs text-text-muted">
                                                    {d.productoSku}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {d.cantidad}
                                            </TableCell>
                                            <TableCell>
                                                {opciones.length === 0 ? (
                                                    <span className="rounded bg-danger-soft px-2 py-1 text-xs font-semibold text-danger">
                                                        Sin lotes disponibles
                                                    </span>
                                                ) : (
                                                    <div className="max-w-md">
                                                        <Select
                                                            options={opciones.map((l) => ({
                                                                value: String(l.id),
                                                                label: `${l.codigo_lote} · vence ${formatDate(
                                                                    l.fecha_vencimiento,
                                                                )} · ${l.dias_para_vencer}d`,
                                                            }))}
                                                            value={value}
                                                            onChange={(e) =>
                                                                setSeleccion((s) => ({
                                                                    ...s,
                                                                    [d.id]: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="flex w-full flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-text-muted">
                                {listo
                                    ? 'Picking listo. Continúa al despacho para generar el envío.'
                                    : 'Falta stock/lote para alguna línea. Revisa antes de despachar.'}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/logistica/ordenes')}
                                >
                                    Volver
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={!listo}
                                    onClick={() =>
                                        navigate(`/logistica/envio/${pedido.id}`)
                                    }
                                >
                                    Confirmar y despachar
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </PageWrapper>
    );
}
