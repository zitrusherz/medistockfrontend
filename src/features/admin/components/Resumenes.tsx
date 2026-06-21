// features/admin/components/Resumenes.tsx
// T4.1 — Resúmenes de solo lectura para el Inicio del Admin. NO reimplementan
// lógica: reusan los mismos hooks/selectores que Logística y Analista
// (useAlertasStock, useAlertasVencimiento, calcularCobranza). React Query
// deduplica, así que aparecer aquí no cuesta una red extra. Muestran el top-N
// más urgente; la gestión completa vive en los paneles de cada rol.

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

/** Tarjeta con título + contenido (encabezado consistente para los 3 paneles). */
function PanelResumen({
    title,
    sub,
    children,
}: {
    title: string;
    sub?: string;
    children: ReactNode;
}) {
    return (
        <Card>
            <div className="mb-3">
                <h3 className="font-display text-base font-bold text-text">{title}</h3>
                {sub && <p className="text-xs text-text-muted">{sub}</p>}
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

    return (
        <PanelResumen title="Stock crítico" sub="Productos bajo el mínimo por sucursal">
            <Table loading={isLoading}>
                <TableHead>
                    <TableRow>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Sucursal</TableColumn>
                        <TableColumn className="text-center">Faltante</TableColumn>
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

    return (
        <PanelResumen title="Vencimientos próximos" sub="Lotes vencidos o a ≤ 10 días">
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
        <PanelResumen title="Por cobrar" sub="Clientes con pedidos exigibles sin pago confirmado">
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
                    emptyText="Sin cuentas por cobrar."
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
