

import type { ReactNode } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@/components/ui';
import { EstadoBadge } from './EstadoBadge';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Pedido } from '@/types/models';

interface OrderModalProps {
    pedido?: Pedido;
    open: boolean;
    onClose: () => void;
    /** Acciones contextuales (aprobar/rechazar) para el footer. */
    acciones?: ReactNode;
}

function SumRow({
    k,
    v,
    strong,
}: {
    k: string;
    v: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-text-muted">{k}</span>
            <span
                className={
                    strong ? 'font-bold text-primary' : 'font-semibold text-text'
                }
            >
                {v}
            </span>
        </div>
    );
}

export function OrderModal({
    pedido,
    open,
    onClose,
    acciones,
}: OrderModalProps) {
    if (!pedido) return null;

    return (
        <Modal open={open} onClose={onClose} size="xl" titleId="order-modal-title">
            <ModalHeader id="order-modal-title">
                Pedido #{pedido.id} · {pedido.cliente || 'Cliente'}
            </ModalHeader>

            <ModalBody>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <EstadoBadge estado={pedido.estado} />
                    {pedido.prioridad !== 'NORMAL' && (
                        <span className="rounded bg-gold-200/60 px-1.5 py-0.5 text-[10px] font-bold text-gold-600">
                            {pedido.prioridad}
                        </span>
                    )}
                    <span className="text-sm text-text-muted">
                        {pedido.sucursalNombre} · {formatDate(pedido.fechaCreacion)}
                    </span>
                </div>

                {/* Líneas del pedido */}
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th className="px-3 py-2 text-left">Producto</th>
                                <th className="px-3 py-2 text-center">Cant.</th>
                                <th className="px-3 py-2 text-right">P. unit.</th>
                                <th className="px-3 py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {pedido.detalles.map((d) => (
                                <tr key={d.id}>
                                    <td className="px-3 py-2">
                                        <span className="font-medium text-text">
                                            {d.productoNombre}
                                        </span>
                                        <span className="ml-2 font-mono text-xs text-text-muted">
                                            {d.productoSku}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">{d.cantidad}</td>
                                    <td className="px-3 py-2 text-right">
                                        {formatCLP(d.precioUnitario)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold">
                                        {formatCLP(d.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Desglose (M2: neto / IVA / total) */}
                <div className="ml-auto mt-4 w-full sm:w-72">
                    <SumRow k="Neto" v={formatCLP(pedido.montoNeto)} />
                    <SumRow k="IVA (19%)" v={formatCLP(pedido.montoIva)} />
                    {pedido.descuentoTotal > 0 && (
                        <SumRow
                            k="Descuento"
                            v={`- ${formatCLP(pedido.descuentoTotal)}`}
                        />
                    )}
                    <div className="mt-1 border-t border-border pt-1">
                        <SumRow k="Total" v={formatCLP(pedido.total)} strong />
                    </div>
                </div>

                {pedido.observacion && (
                    <p className="mt-4 rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-muted">
                        <strong className="text-text">Observación:</strong>{' '}
                        {pedido.observacion}
                    </p>
                )}
            </ModalBody>

            <ModalFooter>
                {acciones ?? (
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}
