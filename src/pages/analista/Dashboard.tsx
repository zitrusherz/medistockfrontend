

import { useMemo } from "react"
import { Link, useNavigate } from "react-router"
import { PageWrapper, PageHeader } from "@/components/layout"
import { Button, Badge } from "@/components/ui"
import { formatCLP } from "@/utils/formatCurrency"
import { usePagos } from "@/features/payments/hooks/usePagos"
import { useTodosPedidos } from "@/features/orders/hooks/useTodosPedidos"
import { PagosKpis } from "@/features/payments/components/PagosKpis"
import { PagosTable } from "@/features/payments/components/PagosTable"
import {
    calcularCobranza,
    totalPorCobrarGlobal,
    totalVencidoGlobal,
} from "@/features/payments/services/cobranza"

function ErrorRecarga({ onRetry }: { onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">
                No pudimos cargar las finanzas. Revisa la conexión e inténtalo de nuevo.
            </p>
            <Button variant="ghost" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    )
}

export default function AnalistaDashboard() {
    const pagosQ = usePagos() // libro completo (dedupe con /analista/pagos)
    const pedidosQ = useTodosPedidos() // dedupe con Ejecutivo/Logística
    const navigate = useNavigate()

    const isError = pagosQ.isError || pedidosQ.isError
    const isLoading = pagosQ.isLoading || pedidosQ.isLoading

    const recientes = useMemo(
        () =>
            [...pagosQ.pagos]
                .sort((a, b) => (a.fechaCreacion < b.fechaCreacion ? 1 : -1))
                .slice(0, 6),
        [pagosQ.pagos],
    )

    const cuentas = useMemo(
        () => calcularCobranza(pagosQ.pagos, pedidosQ.pedidos),
        [pagosQ.pagos, pedidosQ.pedidos],
    )
    const totalPorCobrar = totalPorCobrarGlobal(cuentas)
    const totalVencido = totalVencidoGlobal(cuentas)
    const topMorosos = cuentas.slice(0, 4)

    function reintentar() {
        pagosQ.refetch()
        pedidosQ.refetch()
    }

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Panel de finanzas"
                description="Recaudo, transacciones recientes y cuentas por cobrar."
                breadcrumb={[{ label: "Inicio" }]}
                actions={
                    <Button onClick={() => navigate("/analista/pagos")}>
                        Ver pagos
                    </Button>
                }
            />

            <div className="mt-6 space-y-6">
                {isError ? (
                    <ErrorRecarga onRetry={reintentar} />
                ) : (
                    <PagosKpis pagos={pagosQ.pagos} />
                )}

                {/* Pagos recientes */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-plum-700">
                            Pagos recientes
                        </h2>
                        <Link
                            to="/analista/pagos"
                            className="text-sm font-semibold text-azure-600 hover:text-plum-700"
                        >
                            Ver todos
                        </Link>
                    </div>
                    <PagosTable
                        pagos={recientes}
                        loading={pagosQ.isLoading}
                        emptyText="Aún no hay pagos registrados."
                    />
                </section>

                {/* Cuentas por cobrar (preview) */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-plum-700">
                            Cuentas por cobrar
                        </h2>
                        <Link
                            to="/analista/cobranza"
                            className="text-sm font-semibold text-azure-600 hover:text-plum-700"
                        >
                            Ver cobranza
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-border px-5 py-4">
                            <span>
                                <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Por cobrar
                                </span>
                                <span className="font-display text-xl font-bold text-text">
                                    {formatCLP(totalPorCobrar)}
                                </span>
                            </span>
                            <span>
                                <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Vencido
                                </span>
                                <span className="font-display text-xl font-bold text-danger-strong">
                                    {formatCLP(totalVencido)}
                                </span>
                            </span>
                            <span>
                                <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Clientes
                                </span>
                                <span className="font-display text-xl font-bold text-text">
                                    {cuentas.length}
                                </span>
                            </span>
                        </div>

                        {isLoading ? (
                            <p className="px-5 py-10 text-center text-sm text-text-muted">
                                Cargando cobranza…
                            </p>
                        ) : topMorosos.length === 0 ? (
                            <p className="px-5 py-10 text-center text-sm text-text-muted">
                                Sin cuentas por cobrar: los pedidos exigibles están pagados.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {topMorosos.map((c) => (
                                    <li
                                        key={c.clienteId}
                                        className="flex items-center justify-between gap-4 px-5 py-3"
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate font-medium text-text">
                                                {c.cliente}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {c.cantidadPedidos}{" "}
                                                {c.cantidadPedidos === 1 ? "pedido" : "pedidos"} ·
                                                mora máx. {c.diasMoraMax} d
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-3 whitespace-nowrap">
                                            {c.tieneVencidos && (
                                                <Badge variant="danger" size="sm">
                                                    Vencido
                                                </Badge>
                                            )}
                                            <span className="font-medium text-text">
                                                {formatCLP(c.totalPorCobrar)}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </PageWrapper>
    )
}
