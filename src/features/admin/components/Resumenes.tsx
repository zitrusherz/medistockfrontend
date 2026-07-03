

import type { ReactNode } from 'react';
import {
    Badge,
    Card,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHead,
    TableRow,
} from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAlertasStock } from '@/features/inventory/hooks/useAlertasStock';
import { useAlertasVencimiento } from '@/features/inventory/hooks/useAlertasVencimiento';
import { usePagos } from '@/features/payments/hooks/usePagos';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import { calcularCobranza } from '@/features/payments/services/cobranza';

const TOP = 6;

/** Tarjeta con título + acción + contenido (encabezado de marca, estilo maqueta). */
function PanelResumen({
    title,
    sub,
    action,
    children,
}: {
    title: string;
    sub?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card noPadding>
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <div>
                    <h3 className="font-display text-[19px] font-bold text-primary">{title}</h3>
                    {sub && <p className="text-xs text-text-muted">{sub}</p>}
                </div>
                {action}
            </div>
            {children}
        </Card>
    );
}

// ─── Stock crítico ─────────────────────────────────────────────────────────
export function ResumenStock() {
    const { alertas, isLoading } = useAlertasStock();
    const filas = [...alertas]
        .filter((a) => a.critico || a.agotado)
        .sort((a, b) => b.faltante - a.faltante)
        .slice(0, TOP);
    const agotados = filas.filter((a) => a.agotado).length;

    return (
        <PanelResumen
            title="Productos sin stock"
            sub="Inventario bajo el mínimo, por sucursal"
            action={
                agotados > 0 ? (
                    <Badge variant="danger" size="sm">
                        {agotados} agotado{agotados === 1 ? '' : 's'}
                    </Badge>
                ) : undefined
            }
        >
            <Table loading={isLoading}>
                <TableHead>
                    <TableRow>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Sucursal</TableColumn>
                        <TableColumn className="text-center">Stock</TableColumn>
                    </TableRow>
                </TableHead>
                <TableBody isEmpty={!isLoading && filas.length === 0} emptyText="Sin stock crítico.">
                    {filas.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell>
                                <span className="font-medium text-text">{a.productoNombre}</span>
                                <span className="ml-2 font-mono text-xs text-text-muted">
                                    {a.productoSku}
                                </span>
                            </TableCell>
                            <TableCell className="text-text-muted">{a.sucursalNombre}</TableCell>
                            <TableCell className="text-center">
                                {a.agotado ? (
                                    <Badge variant="danger" size="sm">Agotado</Badge>
                                ) : (
                                    <span className="font-bold text-primary">{a.faltante} u</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </PanelResumen>
    );
}

// ─── Vencimientos próximos ───────────────────────────────────────────────────
export function ResumenVencimientos() {
    const { alertas, isLoading } = useAlertasVencimiento();
    const filas = [...alertas]
        .filter((a) => a.vencido || a.critico)
        .sort((a, b) => a.diasParaVencer - b.diasParaVencer)
        .slice(0, TOP);
    const vencidos = filas.filter((a) => a.vencido).length;

    return (
        <PanelResumen
            title="Productos por vencer"
            sub="Lotes vencidos o a ≤ 10 días"
            action={
                vencidos > 0 ? (
                    <Badge variant="danger" size="sm">
                        {vencidos} vencido{vencidos === 1 ? '' : 's'}
                    </Badge>
                ) : undefined
            }
        >
            <Table loading={isLoading}>
                <TableHead>
                    <TableRow>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Vence</TableColumn>
                        <TableColumn className="text-center">Restantes</TableColumn>
                    </TableRow>
                </TableHead>
                <TableBody isEmpty={!isLoading && filas.length === 0} emptyText="Sin vencimientos críticos.">
                    {filas.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell>
                                <span className="font-medium text-text">{a.productoNombre}</span>
                                <span className="ml-2 font-mono text-xs text-text-muted">
                                    {a.loteCodigo}
                                </span>
                            </TableCell>
                            <TableCell className="text-text-muted">
                                {formatDate(a.fechaVencimiento)}
                            </TableCell>
                            <TableCell className="text-center">
                                {a.vencido ? (
                                    <Badge variant="danger" size="sm">Vencido</Badge>
                                ) : (
                                    <Badge variant="danger" size="sm">{a.diasParaVencer} días</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </PanelResumen>
    );
}

// ─── Morosos / por cobrar ────────────────────────────────────────────────────
export function ResumenMorosos() {
    const { pagos, isLoading: lp } = usePagos();
    const { pedidos, isLoading: lo } = useTodosPedidos();
    const isLoading = lp || lo;

    const cuentas = calcularCobranza(pagos, pedidos).slice(0, TOP);

    return (
        <PanelResumen
            title="Clientes con pagos pendientes"
            sub="Cuentas exigibles sin pago confirmado"
        >
            <Table loading={isLoading}>
                <TableHead>
                    <TableRow>
                        <TableColumn>Cliente</TableColumn>
                        <TableColumn className="text-center">Mora máx.</TableColumn>
                        <TableColumn className="text-right">Por cobrar</TableColumn>
                    </TableRow>
                </TableHead>
                <TableBody
                    isEmpty={!isLoading && cuentas.length === 0}
                    emptyText="Todos los clientes están al día."
                >
                    {cuentas.map((c) => (
                        <TableRow key={c.clienteId}>
                            <TableCell>
                                <span className="font-medium text-text">{c.cliente}</span>
                                {c.rut && (
                                    <span className="block text-xs text-text-muted">{c.rut}</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant={c.tieneVencidos ? 'danger' : 'warning'} size="sm">
                                    {c.diasMoraMax} d
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">
                                {formatCLP(c.totalPorCobrar)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </PanelResumen>
    );
}
