

import { useState, type ReactNode } from 'react';
import { ShoppingCart, Receipt, Users, Banknote } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Card,
    StatCard,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHead,
    TableRow,
} from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { downloadCSV } from '@/utils/csv';
import { useAdminStats } from '@/features/admin/hooks/useAdminStats';
import { useVentasPorCategoria } from '@/features/admin/hooks/useVentasPorCategoria';
import { ErrorRecarga } from '@/features/admin/components/ErrorRecarga';
import { StatActions } from '@/features/admin/components/StatActions';
import { StatModal } from '@/features/admin/components/StatModal';
import { EstadoPedidoBadge } from '@/features/admin/components/EstadoPedidoBadge';
import { VentasBarChart } from '@/features/admin/charts/VentasBarChart';
import { VentasDonut } from '@/features/admin/charts/VentasDonut';
import { TopCompradoresChart } from '@/features/admin/charts/TopCompradoresChart';
import type { RebanadaCategoria } from '@/features/admin/selectors/adminStats';

const HOY = new Date().toISOString().slice(0, 10);

interface DetalleModal {
    title: string;
    description?: string;
    content: ReactNode;
}

/** Encabezado de bloque: título + acciones a la derecha. */
function BloqueHeader({
    title,
    sub,
    actions,
}: {
    title: string;
    sub?: string;
    actions: ReactNode;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="font-display text-lg font-bold text-text">{title}</h2>
                {sub && <p className="text-xs text-text-muted">{sub}</p>}
            </div>
            {actions}
        </div>
    );
}

export default function AdminEstadisticas() {
    const {
        kpis,
        serieMensual,
        ventasPorTipo,
        ranking,
        recientes,
        isLoading,
        isError,
        refetch,
    } = useAdminStats();

    const categoria = useVentasPorCategoria();
    const [detalle, setDetalle] = useState<DetalleModal | null>(null);

    // Donut: categoría real si el backend la entrega; si no, por tipo de venta.
    const usaCategoria = categoria.disponible && categoria.categorias.length > 0;
    const donutData: RebanadaCategoria[] = usaCategoria
        ? categoria.categorias.map((c) => ({ label: c.categoria, value: c.total }))
        : ventasPorTipo;
    const donutSub = usaCategoria
        ? 'Ventas confirmadas por categoría de producto.'
        : 'Ventas confirmadas por tipo de venta (categoría pendiente de backend).';

    // ── Exportadores CSV (filas CRUDAS: montos como número para Excel) ──
    const exportMensual = () =>
        downloadCSV(`estadisticas-ventas-mensuales-${HOY}`, serieMensual, {
            columns: [
                { key: 'key', header: 'Mes' },
                { key: 'total', header: 'Ventas (CLP)' },
            ],
        });

    const exportCategoria = () =>
        downloadCSV(`estadisticas-${usaCategoria ? 'categoria' : 'tipo-venta'}-${HOY}`, donutData, {
            columns: [
                { key: 'label', header: usaCategoria ? 'Categoría' : 'Tipo de venta' },
                { key: 'value', header: 'Ventas (CLP)' },
            ],
        });

    const exportRecientes = () =>
        downloadCSV(
            `estadisticas-pedidos-recientes-${HOY}`,
            recientes.map((p) => ({
                pedido: p.id,
                cliente: p.cliente,
                fecha: formatDate(p.fechaCreacion),
                estado: p.estado,
                total: p.total,
            })),
            {
                columns: [
                    { key: 'pedido', header: 'Pedido' },
                    { key: 'cliente', header: 'Cliente' },
                    { key: 'fecha', header: 'Fecha' },
                    { key: 'estado', header: 'Estado' },
                    { key: 'total', header: 'Total (CLP)' },
                ],
            },
        );

    const exportTop = () =>
        downloadCSV(`estadisticas-top-compradores-${HOY}`, ranking, {
            columns: [
                { key: 'cliente', header: 'Cliente' },
                { key: 'pedidos', header: 'Pedidos' },
                { key: 'total', header: 'Total comprado (CLP)' },
            ],
        });

    // ── Detalles (modal con la tabla cruda) ──
    const detalleMensual = () =>
        setDetalle({
            title: 'Ventas mensuales',
            description: 'Ventas confirmadas por mes (últimos 12 meses).',
            content: (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableColumn>Mes</TableColumn>
                            <TableColumn className="text-right">Ventas</TableColumn>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {serieMensual.map((m) => (
                            <TableRow key={m.key}>
                                <TableCell>{m.label}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCLP(m.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ),
        });

    const detalleCategoria = () =>
        setDetalle({
            title: usaCategoria ? 'Ventas por categoría' : 'Ventas por tipo de venta',
            description: donutSub,
            content: (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableColumn>{usaCategoria ? 'Categoría' : 'Tipo de venta'}</TableColumn>
                            <TableColumn className="text-right">Ventas</TableColumn>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {donutData.map((d) => (
                            <TableRow key={d.label}>
                                <TableCell>{d.label}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCLP(d.value)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ),
        });

    const detalleTop = () =>
        setDetalle({
            title: 'Top compradores',
            description: 'Clientes ordenados por monto total comprado.',
            content: (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableColumn>Cliente</TableColumn>
                            <TableColumn className="text-center">Pedidos</TableColumn>
                            <TableColumn className="text-right">Total</TableColumn>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ranking.map((r) => (
                            <TableRow key={r.clienteId}>
                                <TableCell>{r.cliente}</TableCell>
                                <TableCell className="text-center text-text-muted">
                                    {r.pedidos}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCLP(r.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ),
        });

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Estadísticas"
                description="Analítica de ventas confirmadas de los últimos 12 meses."
                breadcrumb={[{ label: 'Inicio', href: '/admin' }, { label: 'Estadísticas' }]}
            />

            <div className="mt-6 space-y-6">
                {isError ? (
                    <ErrorRecarga
                        mensaje="No pudimos cargar las estadísticas. Revisa la conexión e inténtalo de nuevo."
                        onRetry={refetch}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Ventas (12 meses)"
                            value={formatCLP(kpis.ventas12m)}
                            tone="success"
                            loading={isLoading}
                            icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
                            trend={
                                kpis.crecimiento === null
                                    ? null
                                    : { value: kpis.crecimiento, label: 'vs mes anterior' }
                            }
                        />
                        <StatCard
                            label="Pedidos totales"
                            value={String(kpis.pedidosTotales)}
                            sub="en el sistema"
                            tone="info"
                            loading={isLoading}
                            icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
                        />
                        <StatCard
                            label="Ticket promedio"
                            value={formatCLP(kpis.ticketPromedio)}
                            sub="por pago confirmado"
                            tone="primary"
                            loading={isLoading}
                            icon={<Receipt className="h-5 w-5" aria-hidden="true" />}
                        />
                        <StatCard
                            label="Clientes activos"
                            value={String(kpis.clientesActivos)}
                            sub="con cuenta habilitada"
                            tone="info"
                            loading={isLoading}
                            icon={<Users className="h-5 w-5" aria-hidden="true" />}
                        />
                    </div>
                )}

                {/* Ventas mensuales */}
                <Card>
                    <BloqueHeader
                        title="Ventas mensuales"
                        sub="Ventas confirmadas por mes (últimos 12 meses)"
                        actions={<StatActions onDetalle={detalleMensual} onExport={exportMensual} />}
                    />
                    <VentasBarChart data={serieMensual} />
                </Card>

                {/* Ventas por categoría / tipo */}
                <Card>
                    <BloqueHeader
                        title={usaCategoria ? 'Ventas por categoría' : 'Ventas por tipo de venta'}
                        sub={donutSub}
                        actions={<StatActions onDetalle={detalleCategoria} onExport={exportCategoria} />}
                    />
                    <VentasDonut data={donutData} />
                </Card>

                {/* Pedidos recientes */}
                <Card>
                    <BloqueHeader
                        title="Pedidos recientes"
                        sub="Últimos pedidos ingresados"
                        actions={<StatActions onExport={exportRecientes} />}
                    />
                    <Table loading={isLoading} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableColumn>Pedido</TableColumn>
                                <TableColumn>Cliente</TableColumn>
                                <TableColumn>Fecha</TableColumn>
                                <TableColumn>Estado</TableColumn>
                                <TableColumn className="text-right">Total</TableColumn>
                            </TableRow>
                        </TableHead>
                        <TableBody
                            isEmpty={!isLoading && recientes.length === 0}
                            emptyText="Aún no hay pedidos."
                        >
                            {recientes.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium text-text">#{p.id}</TableCell>
                                    <TableCell>{p.cliente}</TableCell>
                                    <TableCell className="text-text-muted">
                                        {formatDate(p.fechaCreacion)}
                                    </TableCell>
                                    <TableCell>
                                        <EstadoPedidoBadge estado={p.estado} />
                                    </TableCell>
                                    <TableCell className="text-right font-medium whitespace-nowrap">
                                        {formatCLP(p.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                {/* Top compradores */}
                <Card>
                    <BloqueHeader
                        title="Top compradores"
                        sub="Ranking por monto total comprado"
                        actions={<StatActions onDetalle={detalleTop} onExport={exportTop} />}
                    />
                    <TopCompradoresChart data={ranking} />
                </Card>
            </div>

            <StatModal
                open={detalle !== null}
                onClose={() => setDetalle(null)}
                title={detalle?.title ?? ''}
                description={detalle?.description}
            >
                {detalle?.content}
            </StatModal>
        </PageWrapper>
    );
}
