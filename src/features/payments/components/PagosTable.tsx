// features/payments/components/PagosTable.tsx
// T3.7 — Tabla auditable de transacciones. "Tonta": recibe los pagos ya
// normalizados (modelo Pago) y solo los pinta. La lógica (filtros, KPIs) vive
// en la página. Reúsa el kit Table y PagoEstadoBadge.

import {
    Table,
    TableHead,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import type { Pago, MetodoPago } from '@/types/models';
import { PagoEstadoBadge } from './PagoEstadoBadge';

const LABEL_METODO: Record<MetodoPago, string> = {
    WEBPAY: 'Webpay',
    MERCADOPAGO: 'MercadoPago',
    TRANSFERENCIA: 'Transferencia',
    CREDITO_INSTITUCIONAL: 'Crédito inst.',
};

/** Fecha corta local; evita acoplar a utils/formatDate. */
const fecha = (iso: string | null): string =>
    iso ? new Date(iso).toLocaleDateString('es-CL') : '—';

interface Props {
    pagos: Pago[];
    loading?: boolean;
    emptyText?: string;
}

export function PagosTable({
    pagos,
    loading = false,
    emptyText = 'No hay pagos para los filtros seleccionados.',
}: Props) {
    return (
        <Table striped stickyHeader loading={loading}>
            <TableHead>
                <TableRow>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Pedido</TableColumn>
                    <TableColumn>Cliente</TableColumn>
                    <TableColumn>Método</TableColumn>
                    <TableColumn>Estado</TableColumn>
                    <TableColumn className="text-right">Total pedido</TableColumn>
                    <TableColumn className="text-right">Confirmado</TableColumn>
                    <TableColumn>Comprobante</TableColumn>
                </TableRow>
            </TableHead>

            <TableBody isEmpty={!loading && pagos.length === 0} emptyText={emptyText}>
                {pagos.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap text-text-muted">
                            {fecha(p.fechaCreacion)}
                        </TableCell>

                        <TableCell className="font-medium">#{p.pedidoId}</TableCell>

                        <TableCell>
                            <span className="block">{p.clienteNombre ?? '—'}</span>
                            {p.clienteRut && (
                                <span className="block text-xs text-text-muted">
                                    {p.clienteRut}
                                </span>
                            )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                            {LABEL_METODO[p.metodoPago] ?? p.metodoPago}
                        </TableCell>

                        <TableCell>
                            <PagoEstadoBadge estado={p.estadoPago} />
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                            {formatCLP(p.pedidoTotal)}
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                            {p.estadoPago === 'CONFIRMADO' ? (
                                <span className="font-medium text-success-strong">
                                    {formatCLP(p.montoConfirmado)}
                                </span>
                            ) : (
                                <span className="text-text-muted">—</span>
                            )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-xs text-text-muted">
                            {p.authorizationCode ? `Aut. ${p.authorizationCode}` : '—'}
                            {p.cardLastDigits && (
                                <span className="ml-1">•••• {p.cardLastDigits}</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
