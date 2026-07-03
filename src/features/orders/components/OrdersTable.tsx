

import type { ReactNode } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@/components/ui';
import { EstadoBadge } from './EstadoBadge';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Pedido } from '@/types/models';

interface OrdersTableProps {
    pedidos: Pedido[];
    loading?: boolean;
    emptyText?: string;
    /** Botones de acción por fila. Varían por rol; si se omite, no hay columna. */
    renderAcciones?: (pedido: Pedido) => ReactNode;
}

const esUrgente = (p: Pedido) =>
    p.prioridad === 'CRITICA' || p.prioridad === 'ALTA';

export function OrdersTable({
    pedidos,
    loading = false,
    emptyText = 'No hay pedidos en este estado.',
    renderAcciones,
}: OrdersTableProps) {
    return (
        <Table loading={loading} stickyHeader>
            <TableHead>
                <TableRow>
                    <TableColumn>Pedido</TableColumn>
                    <TableColumn>Cliente</TableColumn>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn className="text-center">Ítems</TableColumn>
                    <TableColumn className="text-right">Total</TableColumn>
                    <TableColumn>Estado</TableColumn>
                    {renderAcciones && (
                        <TableColumn className="text-right">Acciones</TableColumn>
                    )}
                </TableRow>
            </TableHead>

            <TableBody
                isEmpty={!loading && pedidos.length === 0}
                emptyText={emptyText}
            >
                {pedidos.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="font-mono font-semibold text-primary">
                            #{p.id}
                            {esUrgente(p) && (
                                <span className="ml-2 rounded bg-gold-200/60 px-1.5 py-0.5 text-[10px] font-bold text-gold-600">
                                    URGENTE
                                </span>
                            )}
                        </TableCell>
                        <TableCell>{p.cliente || '—'}</TableCell>
                        <TableCell className="text-text-muted">
                            {formatDate(p.fechaCreacion)}
                        </TableCell>
                        <TableCell className="text-center text-text-muted">
                            {p.detalles.length}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                            {formatCLP(p.total)}
                        </TableCell>
                        <TableCell>
                            <EstadoBadge estado={p.estado} />
                        </TableCell>
                        {renderAcciones && (
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    {renderAcciones(p)}
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
