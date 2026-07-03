

import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { Package, Clock, Wallet, ShoppingCart, ListOrdered, CreditCard } from "lucide-react"
import { PageWrapper, PageHeader } from "@/components/layout"
import { StatCard, Button, Spinner } from "@/components/ui"
import { EmptyState } from "@/components/common/EmptyState"
import { formatCLP } from "@/utils/formatCurrency"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { useMisPedidos } from "@/features/orders/hooks/useMisPedidos"
import { PedidoCard } from "@/features/orders/components/PedidoCard"
import type { EstadoPedido } from "@/types/models"
import { datosBasicosPerfil } from "@/types/auth"

const TERMINALES: EstadoPedido[] = ["ENTREGADO", "CANCELADO", "RECHAZADO"]
const ANULADOS: EstadoPedido[] = ["RECHAZADO", "CANCELADO"]

function AccesoTile({
                        to,
                        icon,
                        label,
                        hint,
                        badge,
                    }: {
    to: string
    icon: ReactNode
    label: string
    hint: string
    badge?: number
}) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-plum-300"
        >
            <span className="text-plum-700">{icon}</span>
            <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold text-text">
                    {label}
                    {badge != null && badge > 0 && (
                        <span className="rounded-full bg-grape-50 px-2 py-0.5 text-xs font-bold text-grape-700">
                            {badge}
                        </span>
                    )}
                </span>
                <span className="block text-xs text-text-muted">{hint}</span>
            </span>
        </Link>
    )
}

export default function ClienteDashboard() {
    const user = useAuthStore((s) => s.user)
    const nombre = user ? datosBasicosPerfil(user).first_name.trim() : ""
    const itemsCarrito = useCartStore((s) => s.count())
    const navigate = useNavigate()

    const { pedidos, isLoading, isError } = useMisPedidos()

    const activos = pedidos.filter((p) => !TERMINALES.includes(p.estado))
    const pendientesPago = pedidos.filter((p) => p.estado === "PENDIENTE")
    const totalComprado = pedidos
        .filter((p) => !ANULADOS.includes(p.estado))
        .reduce((s, p) => s + p.total, 0)

    const ultimos = [...pedidos]
        .sort((a, b) => (a.fechaCreacion < b.fechaCreacion ? 1 : -1))
        .slice(0, 5)

    const vacio = !isLoading && !isError && pedidos.length === 0

    return (
        <PageWrapper size="xl">
            <PageHeader
                title={nombre ? `Hola, ${nombre}` : "Mi cuenta"}
                description="Resumen de tus pedidos y accesos rápidos."
                breadcrumb={[{ label: "Inicio" }]}
                actions={
                    <Button onClick={() => navigate("/catalogo")}>
                        Explorar catálogo
                    </Button>
                }
            />

            <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        label="Pedidos activos"
                        value={String(activos.length)}
                        sub="en curso"
                        tone="info"
                        loading={isLoading}
                        icon={<Package className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Pendientes de pago"
                        value={String(pendientesPago.length)}
                        sub="por completar"
                        tone="warning"
                        loading={isLoading}
                        icon={<Clock className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Total en compras"
                        value={formatCLP(totalComprado)}
                        sub={`${pedidos.length} ${pedidos.length === 1 ? "pedido" : "pedidos"}`}
                        tone="success"
                        loading={isLoading}
                        icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
                    />
                </div>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-plum-700">
                            Mis últimos pedidos
                        </h2>
                        {pedidos.length > 0 && (
                            <Link
                                to="/cliente/pedidos"
                                className="text-sm font-semibold text-azure-600 hover:text-plum-700"
                            >
                                Ver todos
                            </Link>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-gold">
                        <div className="h-1.5 gold-rule" />
                        {isLoading ? (
                            <div className="flex justify-center px-6 py-16">
                                <Spinner size="lg" />
                            </div>
                        ) : isError ? (
                            <div className="px-6 py-16 text-center">
                                <p className="font-display text-[20px] font-bold text-plum-700">
                                    No pudimos cargar tus pedidos
                                </p>
                                <p className="mt-2 text-sm text-grape-600">
                                    Revisa tu conexión e inténtalo de nuevo en unos segundos.
                                </p>
                            </div>
                        ) : vacio ? (
                            <div className="px-6 py-12">
                                <EmptyState
                                    title="Aún no tienes pedidos"
                                    description="Cuando hagas tu primera compra aparecerá aquí."
                                    action={
                                        <Button onClick={() => navigate("/catalogo")}>
                                            Ir al catálogo
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <div className="divide-y divide-grape-100">
                                {ultimos.map((p) => (
                                    <PedidoCard key={p.id} pedido={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 font-display text-lg font-bold text-plum-700">
                        Accesos rápidos
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <AccesoTile
                            to="/catalogo"
                            icon={<ListOrdered className="h-5 w-5" aria-hidden="true" />}
                            label="Catálogo"
                            hint="Explora productos y stock"
                        />
                        <AccesoTile
                            to="/cliente/carrito"
                            icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
                            label="Carrito"
                            hint="Revisa tu pedido en curso"
                            badge={itemsCarrito}
                        />
                        <AccesoTile
                            to="/cliente/pagos"
                            icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
                            label="Mis pagos"
                            hint="Historial de transacciones"
                        />
                    </div>
                </section>
            </div>
        </PageWrapper>
    )
}