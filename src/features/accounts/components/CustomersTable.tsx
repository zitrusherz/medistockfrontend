// features/accounts/components/CustomersTable.tsx
// T3.3 — Directorio de clientes PRESENTACIONAL y reutilizable. No sabe de roles
// ni de la API; recibe `clientes` y un render-prop `renderAcciones`.
//
// NUEVO (T4.4, mockup admin-customers.jsx): columnas Comuna y Pedidos/Total
// comprado, AMBAS OPCIONALES vía props — si no se pasan, la tabla se ve
// exactamente igual que antes. Así Ejecutivo (T3.3, que usa esta misma tabla
// sin pasar estas props) NO se ve afectado; solo Admin las activa.
//
// "Pedidos"/"Total comprado" NO viven en Cliente (ese dato viene de otro
// dominio: pedidos, no de /accounts/clientes/). Por eso se reciben como un
// Map externo ya agregado (Admin lo arma con useTopCompradores), en vez de
// mancharse este componente con lógica de agregación o llamadas a otra API.

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
import { formatCLP } from '@/utils/formatCurrency';
import type { Cliente } from '../types/cliente';

interface ComprasCliente {
    pedidos: number;
    total: number;
}

interface CustomersTableProps {
    clientes: Cliente[];
    loading?: boolean;
    emptyText?: string;
    /** Botones por fila. Si se omite, no hay columna de acciones. */
    renderAcciones?: (cliente: Cliente) => ReactNode;
    /** Si es true, agrega la columna Comuna (dato ya viene en Cliente). */
    showComuna?: boolean;
    /**
     * Si se pasa, agrega las columnas Pedidos y Total comprado, leyendo por
     * `cliente.id`. Clientes sin entrada en el mapa muestran 0 / $0 (aún no
     * tienen compras registradas, no es un error).
     */
    comprasPorCliente?: Map<number, ComprasCliente>;
}

export function CustomersTable({
                                   clientes,
                                   loading = false,
                                   emptyText = 'No hay clientes para mostrar.',
                                   renderAcciones,
                                   showComuna = false,
                                   comprasPorCliente,
                               }: CustomersTableProps) {
    const showCompras = !!comprasPorCliente;

    return (
        <Table loading={loading} stickyHeader>
            <TableHead>
                <TableRow>
                    <TableColumn>Cliente</TableColumn>
                    <TableColumn>RUT</TableColumn>
                    <TableColumn>Tipo</TableColumn>
                    {showComuna && <TableColumn>Comuna</TableColumn>}
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Teléfono</TableColumn>
                    {showCompras && <TableColumn className="text-center">Pedidos</TableColumn>}
                    {showCompras && (
                        <TableColumn className="text-right">Total comprado</TableColumn>
                    )}
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
                {clientes.map((c) => {
                    const compras = comprasPorCliente?.get(c.id);
                    return (
                        <TableRow key={c.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar name={c.nombre} size="sm" />
                                    <span className="font-semibold text-text">{c.nombre}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-text-muted">
                                {c.rut || '—'}
                            </TableCell>
                            <TableCell>
                                <Badge>{c.tipoLabel}</Badge>
                            </TableCell>
                            {showComuna && (
                                <TableCell className="text-text-muted">
                                    {c.comuna || '—'}
                                </TableCell>
                            )}
                            <TableCell className="text-text-muted">{c.email || '—'}</TableCell>
                            <TableCell className="text-text-muted">{c.telefono || '—'}</TableCell>
                            {showCompras && (
                                <TableCell className="text-center">
                                    {compras?.pedidos ?? 0}
                                </TableCell>
                            )}
                            {showCompras && (
                                <TableCell className="text-right font-bold text-text">
                                    {formatCLP(compras?.total ?? 0)}
                                </TableCell>
                            )}
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
                    );
                })}
            </TableBody>
        </Table>
    );
}