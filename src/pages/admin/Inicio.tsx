// pages/admin/Inicio.tsx
// T4.1 — Tablero operativo del día del Administrador. Banner con saludo +
// SantiagoClock, fila de KPIs operativos y resúmenes de solo lectura (stock,
// vencimientos, por cobrar) que reusan los hooks de Logística/Analista.
// Protegida por RoleRoute (Proxy) en el router.

import { ClipboardList, Users, Wallet, FileText } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui';
import { SantiagoClock } from '@/components/common/SantiagoClock';
import { formatCLP } from '@/utils/formatCurrency';
import { useAdminKpis } from '@/features/admin/hooks/useAdminKpis';
import { ErrorRecarga } from '@/features/admin/components/ErrorRecarga';
import {
    ResumenStock,
    ResumenVencimientos,
    ResumenMorosos,
} from '@/features/admin/components/Resumenes';

export default function AdminInicio() {
    const kpis = useAdminKpis();

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Panel de administración"
                description="Resumen operativo del día. La gestión detallada vive en cada panel de rol."
                breadcrumb={[{ label: 'Inicio' }]}
                actions={<SantiagoClock />}
            />

            <div className="mt-6 space-y-6">
                {kpis.isError && (
                    <ErrorRecarga
                        mensaje="No pudimos cargar los indicadores. Revisa la conexión e inténtalo de nuevo."
                        onRetry={kpis.refetch}
                    />
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Pedidos pendientes"
                        value={String(kpis.pedidosPendientes)}
                        sub="por aprobar"
                        tone="warning"
                        loading={kpis.isLoading}
                        icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Clientes activos"
                        value={String(kpis.clientesActivos)}
                        sub="con cuenta habilitada"
                        tone="info"
                        loading={kpis.isLoading}
                        icon={<Users className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Por cobrar"
                        value={formatCLP(kpis.porCobrar)}
                        sub={`${kpis.clientesMorosos} clientes`}
                        tone="danger"
                        loading={kpis.isLoading}
                        icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
                    />
                    <StatCard
                        label="Cotizaciones pendientes"
                        value={kpis.cotizacionesDisponible ? String(kpis.cotizacionesPendientes ?? 0) : '—'}
                        sub={kpis.cotizacionesDisponible ? 'por revisar' : 'pendiente backend'}
                        tone="neutral"
                        icon={<FileText className="h-5 w-5" aria-hidden="true" />}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    <ResumenStock />
                    <ResumenVencimientos />
                    <ResumenMorosos />
                </div>
            </div>
        </PageWrapper>
    );
}
