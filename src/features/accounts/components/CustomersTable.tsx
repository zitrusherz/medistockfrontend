// features/accounts/components/CustomersTable.tsx
// T3.3 — Directorio de clientes PRESENTACIONAL y reutilizable. Mismo patrón que
// OrdersTable (T3.2): no sabe de roles ni de la API; recibe `clientes` y un
// render-prop `renderAcciones`. "Solo lectura" = no pasarle acciones de mutación,
// no un flag readOnly. Ejecutivo (T3.3) pasa solo "Ver"; Admin (T4.4) sumará
// editar/desactivar/crédito sin tocar este archivo. (IL3.1)

import type { ReactNode } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Avatar,
    Badge,
} from '@/components/ui';
import type { Cliente } from '../types/cliente';

interface CustomersTableProps {
    clientes: Cliente[];
    loading?: boolean;
    emptyText?: string;
    /** Botones por fila. Si se omite, no hay columna de acciones. */
    renderAcciones?: (cliente: Cliente) => ReactNode;
}

export function CustomersTable({
    clientes,
    loading = false,
    emptyText = 'No hay clientes para mostrar.',
    renderAcciones,
}: CustomersTableProps) {
    return (
        <Table loading={loading} stickyHeader>
            <TableHead>
                <TableRow>
                    <TableColumn>Cliente</TableColumn>
                    <TableColumn>RUT</TableColumn>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Teléfono</TableColumn>
                    <TableColumn>Estado</TableColumn>
                    {renderAcciones && (
                        <TableColumn className="text-right">Acciones</TableColumn>
                    )}
                </TableRow>
            </TableHead>

            <TableBody
                isEmpty={!loading && clientes.length === 0}
                emptyText={emptyText}
            >
                {clientes.map((c) => (
                    <TableRow key={c.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar name={c.nombre} size="sm" />
                                <span className="font-semibold text-text">{c.nombre}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-text-muted">{c.rut || '—'}</TableCell>
                        <TableCell>
                            <Badge>
                                {c.tipo === 'INSTITUCIONAL' ? 'Institución' : 'Particular'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-text-muted">{c.email || '—'}</TableCell>
                        <TableCell className="text-text-muted">{c.telefono || '—'}</TableCell>
                        <TableCell>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
                                    c.activo
                                        ? 'bg-success-soft text-success'
                                        : 'bg-grape-100 text-grape-500'
                                }`}
                            >
                                {c.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </TableCell>
                        {renderAcciones && (
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    {renderAcciones(c)}
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
