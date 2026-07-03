

import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { PageWrapper, PageHeader } from "@/components/layout"
import { Button } from "@/components/ui"
import { EmptyState } from "@/components/common/EmptyState"
import { paymentService } from "@/features/payments/services/paymentService"
import { PagosTable } from "@/features/payments/components/PagosTable"

function ErrorRecarga({ onRetry }: { onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">
                No pudimos cargar tus pagos. Revisa la conexión e inténtalo de nuevo.
            </p>
            <Button variant="ghost" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    )
}

export default function MisPagos() {
    const navigate = useNavigate()
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["pagos", "mis"],
        queryFn: () => paymentService.misPagos(),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    })

    const pagos = data ?? []
    const vacio = !isLoading && !isError && pagos.length === 0

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Mis pagos"
                description="Historial de tus transacciones."
                breadcrumb={[{ label: "Inicio", href: "/cliente" }, { label: "Mis pagos" }]}
            />

            <div className="mt-6 space-y-4">
                {isError ? (
                    <ErrorRecarga onRetry={() => refetch()} />
                ) : vacio ? (
                    <EmptyState
                        title="Aún no tienes pagos"
                        description="Cuando completes una compra, tus pagos aparecerán aquí."
                        action={
                            <Button onClick={() => navigate("/catalogo")}>
                                Ir al catálogo
                            </Button>
                        }
                    />
                ) : (
                    <PagosTable
                        pagos={pagos}
                        loading={isLoading}
                        emptyText="Aún no tienes pagos."
                    />
                )}
            </div>
        </PageWrapper>
    )
}
