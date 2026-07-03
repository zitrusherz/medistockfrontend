

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
    Card,
    Button,
    Badge,
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import { usePagos } from '@/features/payments/hooks/usePagos';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import {
    calcularCobranza,
    totalPorCobrarGlobal,
    totalVencidoGlobal,
    totalPedidosPorCobrar,
    DIAS_CREDITO_DEFAULT,
} from '@/features/payments/services/cobranza';
import type { TipoVenta } from '@/types/models';

const LABEL_TIPO_VENTA: Record<TipoVenta, string> = {
    WEBPAY: 'Webpay (B2C)',
    TRANSFERENCIA: 'Transferencia',
    MAYORISTA: 'Mayorista',
    CREDITO_INSTITUCIONAL: 'Crédito inst. (B2B)',
};

function ErrorRecarga({ onRetry }: { onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">
                No pudimos cargar la cobranza. Revisa la conexión e inténtalo de nuevo.
            </p>
            <Button variant="ghost" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    );
}

function KpiCard({
    label,
    valor,
    tone,
}: {
    label: string;
    valor: string;
    tone: 'danger' | 'warning' | 'info';
}) {
    const borde = {
        danger: 'border-l-danger',
        warning: 'border-l-warning',
        info: 'border-l-info',
    }[tone];

    return (
        <Card className={`border-l-4 ${borde}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-text">{valor}</p>
        </Card>
    );
}

export default function AnalistaCobranza() {
    const pagosQ = usePagos(); // dedupe con Pagos
    const pedidosQ = useTodosPedidos(); // dedupe con Ejecutivo/Logística

    const isError = pagosQ.isError || pedidosQ.isError;
    const isLoading = pagosQ.isLoading || pedidosQ.isLoading;

    const cuentas = useMemo(
        () => calcularCobranza(pagosQ.pagos, pedidosQ.pedidos),
        [pagosQ.pagos, pedidosQ.pedidos],
    );

    const totalPorCobrar = totalPorCobrarGlobal(cuentas);
    const totalVencido = totalVencidoGlobal(cuentas);
    const totalPedidos = totalPedidosPorCobrar(cuentas);

    function reintentar() {
        pagosQ.refetch();
        pedidosQ.refetch();
    }

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Cobranza"
                description={`Pedidos pendientes de pago, ordenados por monto. "Vencido" = más de ${DIAS_CREDITO_DEFAULT} días sin pagar (estimado por antigüedad).`}
                breadcrumb={[{ label: 'Inicio', href: '/analista' }, { label: 'Cobranza' }]}
            />

            <div className="mt-6 space-y-6">
                {isError ? (
                    <ErrorRecarga onRetry={reintentar} />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard
                            label="Por cobrar"
                            valor={formatCLP(totalPorCobrar)}
                            tone="warning"
                        />
                        <KpiCard label="Vencido" valor={formatCLP(totalVencido)} tone="danger" />
                        <KpiCard
                            label="Clientes"
                            valor={String(cuentas.length)}
                            tone="info"
                        />
                        <KpiCard
                            label="Pedidos impagos"
                            valor={String(totalPedidos)}
                            tone="info"
                        />
                    </div>
                )}

                <Table striped stickyHeader loading={isLoading}>
                    <TableHead>
                        <TableRow>
                            <TableColumn>Cliente y pedidos</TableColumn>
                            <TableColumn className="text-center">Mora máx.</TableColumn>
                            <TableColumn className="text-right">Vencido</TableColumn>
                            <TableColumn className="text-right">Por cobrar</TableColumn>
                        </TableRow>
                    </TableHead>

                    <TableBody
                        isEmpty={!isLoading && cuentas.length === 0}
                        emptyText="Sin cuentas por cobrar: todos los pedidos exigibles están pagados."
                    >
                        {cuentas.map((c) => (
                            <TableRow key={c.clienteId}>
                                <TableCell>
                                    <span className="block font-medium">{c.cliente}</span>
                                    {c.rut && (
                                        <span className="block text-xs text-text-muted">{c.rut}</span>
                                    )}
                                    <ul className="mt-1.5 space-y-0.5">
                                        {c.pedidos.map((p) => (
                                            <li
                                                key={p.pedidoId}
                                                className="flex items-center gap-2 text-xs text-text-muted"
                                            >
                                                <span className="font-medium text-text">
                                                    #{p.pedidoId}
                                                </span>
                                                <span>{LABEL_TIPO_VENTA[p.tipoVenta] ?? p.tipoVenta}</span>
                                                <span>· {p.diasMora} d</span>
                                                {p.vencido && (
                                                    <Badge variant="danger" size="sm">
                                                        Vencido
                                                    </Badge>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>

                                <TableCell className="text-center align-top">
                                    <Badge variant={c.tieneVencidos ? 'danger' : 'warning'} size="sm">
                                        {c.diasMoraMax} d
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-right align-top whitespace-nowrap">
                                    {c.totalVencido > 0 ? (
                                        <span className="font-medium text-danger-strong">
                                            {formatCLP(c.totalVencido)}
                                        </span>
                                    ) : (
                                        <span className="text-text-muted">—</span>
                                    )}
                                </TableCell>

                                <TableCell className="text-right align-top whitespace-nowrap font-medium">
                                    {formatCLP(c.totalPorCobrar)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </PageWrapper>
    );
}
