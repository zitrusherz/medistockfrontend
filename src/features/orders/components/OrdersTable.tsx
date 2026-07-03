// src/features/orders/components/OrdersTable.tsx

import { useMemo, useState, type ReactNode } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Select,
    Badge,
} from '@/components/ui';
import type { SortState } from '@/components/ui';
import { EstadoBadge } from './EstadoBadge';
import { PagoEstadoBadge } from '@/features/payments/components/PagoEstadoBadge';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ESTADO_PEDIDO_LABEL, ESTADO_PAGO_LABEL } from '@/utils/labels';
import type { Pedido, Pago } from '@/types/models';

type GroupBy = 'none' | 'cliente' | 'fecha';
type SortColumn = 'id' | 'cliente' | 'fecha' | 'total' | 'estado' | 'pago';

const PAGO_FILTRO_TODOS = 'TODOS';
const PAGO_FILTRO_SIN_PAGO = 'SIN_PAGO';

interface OrdersTableProps {
    pedidos: Pedido[];
    /** Si se pasa, habilita columna "Pago" + su filtro y orden. */
    pagos?: Pago[];
    loading?: boolean;
    emptyText?: string;
    /** Botones de acción por fila. Varían por rol; si se omite, no hay columna. */
    renderAcciones?: (pedido: Pedido) => ReactNode;
}

const esUrgente = (p: Pedido) =>
    p.prioridad === 'CRITICA' || p.prioridad === 'ALTA';

/** Pago más reciente por pedido (un pedido puede tener varios intentos). */
function buildPagoPorPedido(pagos: Pago[]): Map<number, Pago> {
    const m = new Map<number, Pago>();
    for (const pago of pagos) {
        const previo = m.get(pago.pedidoId);
        if (!previo || pago.fechaCreacion > previo.fechaCreacion) {
            m.set(pago.pedidoId, pago);
        }
    }
    return m;
}

function compararPedidos(
    a: Pedido,
    b: Pedido,
    column: SortColumn,
    pagoPorPedido: Map<number, Pago>,
): number {
    switch (column) {
        case 'id':
            return a.id - b.id;
        case 'cliente':
            return (a.cliente || '').localeCompare(b.cliente || '', 'es');
        case 'fecha':
            return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
        case 'total':
            return a.total - b.total;
        case 'estado':
            return ESTADO_PEDIDO_LABEL[a.estado].localeCompare(ESTADO_PEDIDO_LABEL[b.estado], 'es');
        case 'pago': {
            const la = pagoPorPedido.get(a.id);
            const lb = pagoPorPedido.get(b.id);
            const textoA = la ? ESTADO_PAGO_LABEL[la.estadoPago] : '';
            const textoB = lb ? ESTADO_PAGO_LABEL[lb.estadoPago] : '';
            return textoA.localeCompare(textoB, 'es');
        }
        default:
            return 0;
    }
}

interface Grupo {
    key: string;
    label: string;
    items: Pedido[];
}

function agruparPedidos(pedidos: Pedido[], groupBy: GroupBy): Grupo[] {
    if (groupBy === 'none') {
        return [{ key: '__all__', label: '', items: pedidos }];
    }

    const buckets = new Map<string, Pedido[]>();
    for (const p of pedidos) {
        const key = groupBy === 'cliente' ? p.cliente || 'Sin cliente' : formatDate(p.fechaCreacion);
        const arr = buckets.get(key) ?? [];
        arr.push(p);
        buckets.set(key, arr);
    }

    const grupos: Grupo[] = Array.from(buckets.entries()).map(([key, items]) => ({
        key,
        label: key,
        items,
    }));

    if (groupBy === 'cliente') {
        grupos.sort((a, b) => a.key.localeCompare(b.key, 'es'));
    } else {
        grupos.sort((a, b) => {
            const fechaA = a.items[0]?.fechaCreacion;
            const fechaB = b.items[0]?.fechaCreacion;

            if (!fechaA && !fechaB) return 0;
            if (!fechaA) return 1;
            if (!fechaB) return -1;

            const da = new Date(fechaA).getTime();
            const db = new Date(fechaB).getTime();

            return db - da;
        });
    }

    return grupos;
}

export function OrdersTable({
                                pedidos,
                                pagos,
                                loading = false,
                                emptyText = 'No hay pedidos en este estado.',
                                renderAcciones,
                            }: OrdersTableProps) {
    const [sort, setSort] = useState<SortState>({ column: null, direction: 'asc' });
    const [groupBy, setGroupBy] = useState<GroupBy>('none');
    const [pagoFiltro, setPagoFiltro] = useState<string>(PAGO_FILTRO_TODOS);

    const pagoPorPedido = useMemo(
        () => (pagos ? buildPagoPorPedido(pagos) : new Map<number, Pago>()),
        [pagos],
    );

    const filtrados = useMemo(() => {
        if (!pagos || pagoFiltro === PAGO_FILTRO_TODOS) return pedidos;
        return pedidos.filter((p) => {
            const pago = pagoPorPedido.get(p.id);
            if (pagoFiltro === PAGO_FILTRO_SIN_PAGO) return !pago;
            return pago?.estadoPago === pagoFiltro;
        });
    }, [pedidos, pagos, pagoFiltro, pagoPorPedido]);

    const ordenados = useMemo(() => {
        if (!sort.column) return filtrados;
        const columna = sort.column as SortColumn;
        const copia = [...filtrados].sort((a, b) => compararPedidos(a, b, columna, pagoPorPedido));
        if (sort.direction === 'desc') copia.reverse();
        return copia;
    }, [filtrados, sort, pagoPorPedido]);

    const grupos = useMemo(() => agruparPedidos(ordenados, groupBy), [ordenados, groupBy]);

    const totalColumnas = 6 + (pagos ? 1 : 0) + (renderAcciones ? 1 : 0);

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-end justify-end gap-3">
                <Select
                    label="Agrupar por"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                    options={[
                        { value: 'none', label: 'Sin agrupar' },
                        { value: 'cliente', label: 'Cliente' },
                        { value: 'fecha', label: 'Fecha' },
                    ]}
                    fullWidth={false}
                    className="min-w-[9rem]"
                />
                {pagos && (
                    <Select
                        label="Estado de pago"
                        value={pagoFiltro}
                        onChange={(e) => setPagoFiltro(e.target.value)}
                        options={[
                            { value: PAGO_FILTRO_TODOS, label: 'Todos' },
                            { value: PAGO_FILTRO_SIN_PAGO, label: 'Sin pago' },
                            ...Object.entries(ESTADO_PAGO_LABEL).map(([value, label]) => ({
                                value,
                                label,
                            })),
                        ]}
                        fullWidth={false}
                        className="min-w-[9rem]"
                    />
                )}
            </div>

            <Table loading={loading} stickyHeader sortable onSortChange={setSort}>
                <TableHead>
                    <TableRow>
                        <TableColumn sortKey="id">Pedido</TableColumn>
                        <TableColumn sortKey="cliente">Cliente</TableColumn>
                        <TableColumn sortKey="fecha">Fecha</TableColumn>
                        <TableColumn className="text-center">Ítems</TableColumn>
                        <TableColumn className="text-right" sortKey="total">
                            Total
                        </TableColumn>
                        <TableColumn sortKey="estado">Estado</TableColumn>
                        {pagos && <TableColumn sortKey="pago">Pago</TableColumn>}
                        {renderAcciones && (
                            <TableColumn className="text-right">Acciones</TableColumn>
                        )}
                    </TableRow>
                </TableHead>

                <TableBody isEmpty={!loading && ordenados.length === 0} emptyText={emptyText}>
                    {grupos.flatMap((g) => {
                        const filas = g.items.map((p) => (
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
                                {pagos && (
                                    <TableCell>
                                        {(() => {
                                            const pago = pagoPorPedido.get(p.id);
                                            return pago ? (
                                                <PagoEstadoBadge estado={pago.estadoPago} />
                                            ) : (
                                                <Badge variant="neutral" size="sm">
                                                    Sin pago
                                                </Badge>
                                            );
                                        })()}
                                    </TableCell>
                                )}
                                {renderAcciones && (
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {renderAcciones(p)}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ));

                        if (groupBy === 'none') return filas;

                        return [
                            <TableRow key={`grupo-${g.key}`} className="bg-surface-muted">
                                <TableCell
                                    colSpan={totalColumnas}
                                    className="py-2 text-xs font-bold uppercase tracking-wide text-text-muted"
                                >
                                    {groupBy === 'cliente' ? g.label : `Fecha: ${g.label}`}
                                    <span className="ml-2 font-normal normal-case text-text-muted/70">
                                        ({g.items.length})
                                    </span>
                                </TableCell>
                            </TableRow>,
                            ...filas,
                        ];
                    })}
                </TableBody>
            </Table>
        </div>
    );
}