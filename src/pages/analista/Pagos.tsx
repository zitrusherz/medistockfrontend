

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui';
import { usePagos } from '@/features/payments/hooks/usePagos';
import { PagosKpis } from '@/features/payments/components/PagosKpis';
import { PagosFilters } from '@/features/payments/components/PagosFilters';
import { PagosTable } from '@/features/payments/components/PagosTable';
import type { TodosPagosFilters } from '@/features/payments/types';

function ErrorRecarga({ onRetry }: { onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3"
        >
            <p className="text-sm text-danger-strong">
                No pudimos cargar los pagos. Revisa la conexión e inténtalo de nuevo.
            </p>
            <Button variant="ghost" onClick={onRetry}>
                Reintentar
            </Button>
        </div>
    );
}

export default function AnalistaPagos() {
    const [filtros, setFiltros] = useState<TodosPagosFilters>({});
    const { pagos, isLoading, isError, refetch } = usePagos(); // libro completo, 1 fetch

    const filtroActivo = Boolean(filtros.estado_pago || filtros.metodo_pago);

    const visibles = useMemo(
        () =>
            pagos.filter(
                (p) =>
                    (!filtros.estado_pago || p.estadoPago === filtros.estado_pago) &&
                    (!filtros.metodo_pago || p.metodoPago === filtros.metodo_pago),
            ),
        [pagos, filtros.estado_pago, filtros.metodo_pago],
    );

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Pagos"
                description="Audita el libro de transacciones: filtra por estado y método y revisa el recaudo."
                breadcrumb={[{ label: 'Inicio', href: '/analista' }, { label: 'Pagos' }]}
            />

            <div className="mt-6 space-y-6">
                {isError ? (
                    <ErrorRecarga onRetry={() => refetch()} />
                ) : (
                    <PagosKpis pagos={pagos} />
                )}

                <div className="space-y-4">
                    <PagosFilters filtros={filtros} onChange={setFiltros} />
                    <PagosTable
                        pagos={visibles}
                        loading={isLoading}
                        emptyText={
                            filtroActivo
                                ? 'No hay pagos para los filtros seleccionados.'
                                : 'Aún no hay pagos registrados.'
                        }
                    />
                </div>
            </div>
        </PageWrapper>
    );
}
