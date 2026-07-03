

import { useMemo } from "react"
import { Link, useNavigate } from "react-router"
import { PackageCheck, Hammer, AlertTriangle, CalendarClock, ListChecks, BellRing } from "lucide-react"
import { PageWrapper, PageHeader } from "@/components/layout"
import { StatCard, Button } from "@/components/ui"
import { useTodosPedidos } from "@/features/orders/hooks/useTodosPedidos"
import { useAlertasStock } from "@/features/inventory/hooks/useAlertasStock"
import { useAlertasVencimiento } from "@/features/inventory/hooks/useAlertasVencimiento"
import { ordenarColaLogistica } from "@/features/logistics/services/colaPrioridad"
import { OrdersTable } from "@/features/orders/components/OrdersTable"

function ErrorRecarga({ onRetry }: { onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">
                No pudimos cargar la operación. Revisa la conexión e inténtalo de nuevo.
            </p>
            <Button variant="ghost" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    )
}

function AccesoTile({
    to,
    icon,
    label,
    hint,
}: {
    to: string
    icon: React.ReactNode
    label: string
    hint: string
}) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-plum-300"
        >
            <span className="text-plum-700">{icon}</span>
            <span className="min-w-0">
                <span className="block font-semibold text-text">{label}</span>
                <span className="block text-xs text-text-muted">{hint}</span>
            </span>
        </Link>
    )
}

export default function LogisticaDashboard() {
    const { pedidos, isLoading, isError, refetch } = useTodosPedidos()
    const { alertas: alertasStock, isLoading: cargandoStock } = useAlertasStock()
    const { alertas: alertasVenc, isLoading: cargandoVenc } = useAlertasVencimiento()
    const navigate = useNavigate()

    const porPreparar = useMemo(
        () => pedidos.filter((p) => p.estado === "APROBADO"),
        [pedidos],
    )
    const enPicking = useMemo(
        () => pedidos.filter((p) => p.estado === "EN_PICKING"),
        [pedidos],
    )
    const cola = useMemo(() => ordenarColaLogistica(porPreparar).slice(0, 6), [porPreparar])

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Panel de logística"
                description="Cola priorizada por urgencia médica y alertas operativas."
                breadcrumb={[{ label: "Inicio" }]}
                actions={
                    <Button onClick={() => navigate("/logistica/ordenes")}>
                        Ver órdenes
                    </Button>
                }
            />

            <div className="mt-6 space-y-6">
                {isError && <ErrorRecarga onRetry={() => refetch()} />}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Por preparar"
                        value={String(porPreparar.length)}
                        sub="aprobados"
                        tone="warning"
                        loading={isLoading}
                        icon={<PackageCheck className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="En preparación"
                        value={String(enPicking.length)}
                        sub="en picking"
                        tone="info"
                        loading={isLoading}
                        icon={<Hammer className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Stock crítico"
                        value={String(alertasStock.length)}
                        sub="productos en alerta"
                        tone="danger"
                        loading={cargandoStock}
                        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Lotes por vencer"
                        value={String(alertasVenc.length)}
                        sub="próximos a caducar"
                        tone="warning"
                        loading={cargandoVenc}
                        icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
                    />
                </div>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-plum-700">
                            Cola priorizada
                        </h2>
                        <Link
                            to="/logistica/ordenes"
                            className="text-sm font-semibold text-azure-600 hover:text-plum-700"
                        >
                            Ver todas
                        </Link>
                    </div>
                    <OrdersTable
                        pedidos={cola}
                        loading={isLoading}
                        emptyText="No hay pedidos aprobados en cola."
                        renderAcciones={() => (
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => navigate("/logistica/ordenes")}
                            >
                                Preparar
                            </Button>
                        )}
                    />
                </section>

                <section>
                    <h2 className="mb-3 font-display text-lg font-bold text-plum-700">
                        Accesos rápidos
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <AccesoTile
                            to="/logistica/ordenes"
                            icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
                            label="Órdenes"
                            hint="Preparar, despachar y trackear"
                        />
                        <AccesoTile
                            to="/logistica/alertas"
                            icon={<BellRing className="h-5 w-5" aria-hidden="true" />}
                            label="Alertas"
                            hint="Stock y vencimientos por sucursal"
                        />
                    </div>
                </section>
            </div>
        </PageWrapper>
    )
}
