// src/pages/admin/TopCompradores.tsx
// T4.4 — Página Admin · Top compradores. Ranking de clientes por monto total
// comprado, agregado en front desde los pedidos (useTopCompradores). Protegida
// por RoleRoute (Proxy) para el rol Administrador. Ruta: /admin/top-compradores.
// Export default → lazy().

import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { TopBuyers } from '@/features/accounts/components/TopBuyers';
import { useTopCompradores } from '@/features/accounts/hooks/useTopCompradores';

export default function AdminTopCompradores() {
    const { ranking, isLoading, isError } = useTopCompradores();

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Top compradores"
                description="Ranking de clientes por monto total comprado. Excluye pedidos rechazados y cancelados."
                breadcrumb={[{ label: 'Inicio' }, { label: 'Top compradores' }]}
            />

            <div className="mt-6">
                <Card>
                    {isError ? (
                        <div
                            role="alert"
                            className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
                        >
                            No se pudo cargar el ranking. Reintenta más tarde.
                        </div>
                    ) : (
                        <TopBuyers ranking={ranking} loading={isLoading} limit={10} />
                    )}
                </Card>
            </div>
        </PageWrapper>
    );
}
