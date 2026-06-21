// src/pages/ejecutivo/Dashboard.tsx — ruta: /ejecutivo
// Apéndice D #5 — Aterrizaje del Ejecutivo: foco en lo que espera aprobación.
// Container: reúsa useTodosPedidos (libro completo, ya cacheado por la bandeja),
// useClientes (conteo) y OrdersTable (preview). Cero lógica nueva. Patrón de
// estados igual a pages/analista/Pagos.tsx (ErrorRecarga inline + loading del
// componente). Protegida por RoleRoute (Proxy) en el router.

import { useMemo } from "react"
import { Link, useNavigate } from "react-router"
import { ClipboardCheck, BadgeCheck, Users, Boxes, Building2 } from "lucide-react"
import { PageWrapper, PageHeader } from "@/components/layout"
import { StatCard, Button } from "@/components/ui"
import { useTodosPedidos } from "@/features/orders/hooks/useTodosPedidos"
import { useClientes } from "@/features/accounts/hooks/useClientes"
import { OrdersTable } from "@/features/orders/components/OrdersTable"

function ErrorRecarga({ onRetry }: { onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">
                No pudimos cargar los pedidos. Revisa la conexión e inténtalo de nuevo.
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

export default function EjecutivoDashboard() {
    const { pedidos, isLoading, isError, refetch } = useTodosPedidos()
    const { clientes } = useClientes()
    const navigate = useNavigate()

    const pendientes = useMemo(
        () => pedidos.filter((p) => p.estado === "PENDIENTE"),
        [pedidos],
    )
    const aprobados = useMemo(
        () => pedidos.filter((p) => p.estado === "APROBADO"),
        [pedidos],
    )
    const preview = pendientes.slice(0, 5)

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Panel del ejecutivo"
                description="Lo que espera tu aprobación y derivación a logística."
                breadcrumb={[{ label: "Inicio" }]}
                actions={
                    <Button onClick={() => navigate("/ejecutivo/pedidos")}>
                        Ir a la bandeja
                    </Button>
                }
            />

            <div className="mt-6 space-y-6">
                {isError && <ErrorRecarga onRetry={() => refetch()} />}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        label="Pendientes de aprobar"
                        value={String(pendientes.length)}
                        sub="requieren acción"
                        tone="warning"
                        loading={isLoading}
                        icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Aprobados"
                        value={String(aprobados.length)}
                        sub="en curso"
                        tone="success"
                        loading={isLoading}
                        icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Clientes activos"
                        value={String(clientes.length)}
                        sub="con cuenta habilitada"
                        tone="info"
                        icon={<Users className="h-5 w-5" aria-hidden="true" />}
                    />
                </div>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-plum-700">
                            Pedidos por aprobar
                        </h2>
                        <Link
                            to="/ejecutivo/pedidos"
                            className="text-sm font-semibold text-azure-600 hover:text-plum-700"
                        >
                            Ver todos
                        </Link>
                    </div>
                    <OrdersTable
                        pedidos={preview}
                        loading={isLoading}
                        emptyText="No hay pedidos pendientes de aprobación."
                        renderAcciones={() => (
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => navigate("/ejecutivo/pedidos")}
                            >
                                Revisar
                            </Button>
                        )}
                    />
                </section>

                <section>
                    <h2 className="mb-3 font-display text-lg font-bold text-plum-700">
                        Accesos rápidos
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <AccesoTile
                            to="/ejecutivo/pedidos"
                            icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
                            label="Pedidos"
                            hint="Aprobar / rechazar"
                        />
                        <AccesoTile
                            to="/ejecutivo/stock"
                            icon={<Boxes className="h-5 w-5" aria-hidden="true" />}
                            label="Stock"
                            hint="Consulta por bodega"
                        />
                        <AccesoTile
                            to="/ejecutivo/clientes"
                            icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
                            label="Clientes"
                            hint="Directorio institucional"
                        />
                    </div>
                </section>
            </div>
        </PageWrapper>
    )
}
