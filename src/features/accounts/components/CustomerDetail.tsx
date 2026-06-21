// features/accounts/components/CustomerDetail.tsx
// T3.3 / T4.4 — Modal de detalle de cliente. Autocontenido: tiene sus PROPIAS
// queries perezosas (enabled = open), así la página no precarga nada. Compone
// features: datos del cliente (accounts) + sus pedidos (orders) + sus pagos
// (payments, solo Admin). Tabs (ui/Tabs) en modo lectura; CreditBar para
// institucionales con cupo.
//
// T4.4 — Nueva prop `showPagos` (default false):
//   - Ejecutivo (T3.3) lo monta SIN la prop → sigue con 2 tabs (Datos/Pedidos)
//     y NO consulta /payments/todos/ (evita 403 por permisos).
//   - Admin (T4.4) pasa showPagos → aparece el 3er tab "Pagos". El hook de pagos
//     se gatilla solo si (open && showPagos), así no hay fetch para Ejecutivo.
//
// Recibe la fila `cliente` como fallback inmediato y la enriquece con el detalle
// cuando llega (crédito, etc.). Si el endpoint de detalle no existe/falla, se
// muestra igual lo que ya traía la fila.

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Avatar,
    Badge,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Spinner,
} from '@/components/ui';
import { EstadoBadge } from '@/features/orders/components/EstadoBadge';
import { PagoEstadoBadge } from '@/features/payments/components/PagoEstadoBadge';
import { formatCLP } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useClienteDetalle } from '../hooks/useClienteDetalle';
import { useClientePedidos } from '../hooks/useClientePedidos';
import { useClientePagos } from '../hooks/useClientePagos';
import type { Cliente } from '../types/cliente';

interface CustomerDetailProps {
    cliente?: Cliente;
    open: boolean;
    onClose: () => void;
    /** T4.4: muestra el tab "Pagos" (solo roles con acceso a /payments/todos/). */
    showPagos?: boolean;
}

/** Barra de crédito (porta CreditBar de la maqueta a tokens del kit). */
function CreditBar({ usado, cupo }: { usado: number; cupo: number }) {
    const pct = cupo > 0 ? Math.min(100, Math.round((usado / cupo) * 100)) : 0;
    const tono =
        pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-success';
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-text-muted">Crédito utilizado</span>
                <span className="font-semibold text-text">
                    {formatCLP(usado)} / {formatCLP(cupo)}
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className={`h-full ${tono}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function Dato({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-text-muted">{k}</span>
            <span className="font-medium text-text">{v}</span>
        </div>
    );
}

export function CustomerDetail({
    cliente,
    open,
    onClose,
    showPagos = false,
}: CustomerDetailProps) {
    const { cliente: detalle } = useClienteDetalle(cliente?.id, open);
    const { pedidos, isLoading: cargandoPedidos, isEmpty: sinPedidos } =
        useClientePedidos(cliente?.id, open);
    const { pagos, isLoading: cargandoPagos, isEmpty: sinPagos } =
        useClientePagos(cliente?.id, open && showPagos);

    if (!cliente) return null;
    const c = detalle ?? cliente; // detalle enriquece; fallback = fila

    const esInstitucion = c.tipo === 'INSTITUCIONAL';
    const tieneCredito =
        esInstitucion && c.cupoCredito != null && c.cupoCredito > 0;

    // Total efectivamente cobrado (confirmado), para la cabecera del tab Pagos.
    const totalConfirmado = pagos
        .filter((p) => p.estadoPago === 'CONFIRMADO')
        .reduce((s, p) => s + p.montoConfirmado, 0);

    return (
        <Modal open={open} onClose={onClose} size="xl" titleId="cliente-detail-title">
            <ModalHeader id="cliente-detail-title">
                <span className="flex items-center gap-3">
                    <Avatar name={c.nombre} size="md" />
                    <span className="flex flex-col">
                        <span>{c.nombre}</span>
                        <span className="text-xs font-normal text-text-muted">
                            {c.rut || 'sin RUT'}
                        </span>
                    </span>
                </span>
            </ModalHeader>

            <ModalBody>
                <Tabs defaultTab="datos" variant="underline">
                    <TabList>
                        <Tab id="datos">Datos</Tab>
                        <Tab id="pedidos">Pedidos</Tab>
                        {showPagos && <Tab id="pagos">Pagos</Tab>}
                    </TabList>

                    {/* ── Datos ── */}
                    <TabPanel id="datos">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge>{esInstitucion ? 'Institución' : 'Particular'}</Badge>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
                                    c.activo
                                        ? 'bg-success-soft text-success'
                                        : 'bg-grape-100 text-grape-500'
                                }`}
                            >
                                {c.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className="divide-y divide-border">
                            <Dato k="Email" v={c.email || '—'} />
                            <Dato k="Teléfono" v={c.telefono || '—'} />
                            <Dato
                                k="Registrado"
                                v={c.fechaRegistro ? formatDate(c.fechaRegistro) : '—'}
                            />
                        </div>

                        {tieneCredito && (
                            <div className="mt-4 rounded-lg border border-border p-4">
                                <CreditBar
                                    usado={c.creditoUsado ?? 0}
                                    cupo={c.cupoCredito ?? 0}
                                />
                            </div>
                        )}
                    </TabPanel>

                    {/* ── Pedidos ── */}
                    <TabPanel id="pedidos">
                        {cargandoPedidos ? (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        ) : sinPedidos ? (
                            <p className="py-8 text-center text-sm text-text-muted">
                                Este cliente no tiene pedidos.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Pedido</th>
                                            <th className="px-3 py-2 text-left">Fecha</th>
                                            <th className="px-3 py-2 text-right">Total</th>
                                            <th className="px-3 py-2 text-left">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {pedidos.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-3 py-2 font-mono font-semibold text-primary">
                                                    #{p.id}
                                                </td>
                                                <td className="px-3 py-2 text-text-muted">
                                                    {formatDate(p.fechaCreacion)}
                                                </td>
                                                <td className="px-3 py-2 text-right font-bold">
                                                    {formatCLP(p.total)}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <EstadoBadge estado={p.estado} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabPanel>

                    {/* ── Pagos (solo Admin) ── */}
                    {showPagos && (
                        <TabPanel id="pagos">
                            {cargandoPagos ? (
                                <div className="flex justify-center py-8">
                                    <Spinner />
                                </div>
                            ) : sinPagos ? (
                                <p className="py-8 text-center text-sm text-text-muted">
                                    Este cliente no tiene pagos registrados.
                                </p>
                            ) : (
                                <>
                                    <div className="mb-3 flex items-center justify-between rounded-lg bg-surface-muted px-4 py-2.5 text-sm">
                                        <span className="text-text-muted">
                                            Total confirmado
                                        </span>
                                        <span className="font-bold text-text">
                                            {formatCLP(totalConfirmado)}
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Pedido</th>
                                                    <th className="px-3 py-2 text-left">Fecha</th>
                                                    <th className="px-3 py-2 text-left">Método</th>
                                                    <th className="px-3 py-2 text-right">Monto</th>
                                                    <th className="px-3 py-2 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {pagos.map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="px-3 py-2 font-mono font-semibold text-primary">
                                                            #{p.pedidoId}
                                                        </td>
                                                        <td className="px-3 py-2 text-text-muted">
                                                            {formatDate(p.fechaCreacion)}
                                                        </td>
                                                        <td className="px-3 py-2 text-text-muted">
                                                            {p.metodoPago}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-bold">
                                                            {formatCLP(
                                                                p.montoConfirmado || p.pedidoTotal,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <PagoEstadoBadge estado={p.estadoPago} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </TabPanel>
                    )}
                </Tabs>
            </ModalBody>

            <ModalFooter>
                <Button variant="secondary" onClick={onClose}>
                    Cerrar
                </Button>
            </ModalFooter>
        </Modal>
    );
}
