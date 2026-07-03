// src/pages/admin/Inicio.tsx
// T4.1 — Tablero operativo del día del Administrador. Banner con saludo +
// SantiagoClock, fila de KPIs operativos y resúmenes de solo lectura (stock,
// vencimientos, por cobrar) que reusan los hooks de Logística/Analista.
// Protegida por RoleRoute (Proxy) en el router.
//
// EDICIÓN VISUAL — calcado de la maqueta (admin-home.jsx / captura Inicio):
//  · Se agregó InicioBanner (saludo + reloj) que antes no existía.
//  · Las 4 StatCard genéricas se reemplazaron por PendingActionCard (icono
//    degradado + tarjeta clickeable → navega a la sección relacionada).
//  · La tarjeta "Cotizaciones pendientes" se mantiene igual que antes
//    (kpis.cotizacionesDisponible ? … : '—'): sigue sin dato real de backend,
//    por eso NO tiene onClick. No se agregó "Cotizaciones" al sidebar (así se
//    definió), pero este KPI ya existía en el código original y se conserva.
//  · Stock + Vencimientos ahora van lado a lado (2 columnas) y Morosos pasa a
//    fila completa abajo, igual que la maqueta. Antes las 3 iban en una sola
//    fila de 3 columnas.

import { useNavigate } from 'react-router';
import { ClipboardList, Users, Wallet, FileText } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCLP } from '@/utils/formatCurrency';
import { useAdminKpis } from '@/features/admin/hooks/useAdminKpis';
import { ErrorRecarga } from '@/features/admin/components/ErrorRecarga';
import { InicioBanner } from '@/features/admin/components/InicioBanner';
import { PendingActionCard } from '@/features/admin/components/PendingActionCard';
import {
    ResumenStock,
    ResumenVencimientos,
    ResumenMorosos,
} from '@/features/admin/components/Resumenes';

export default function AdminInicio() {
    const kpis = useAdminKpis();
    const navigate = useNavigate();

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Panel de administración"
                description="Resumen operativo del día. La gestión detallada vive en cada panel de rol."
                breadcrumb={[{ label: 'Inicio' }]}
            />

            <div className="mt-6 space-y-6">
                {kpis.isError && (
                    <ErrorRecarga
                        mensaje="No pudimos cargar los indicadores. Revisa la conexión e inténtalo de nuevo."
                        onRetry={kpis.refetch}
                    />
                )}

                <InicioBanner pedidosPendientes={kpis.isLoading ? 0 : kpis.pedidosPendientes} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PendingActionCard
                        tone="gold"
                        icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
                        value={kpis.isLoading ? '—' : kpis.pedidosPendientes}
                        label="Pedidos pendientes"
                        hint="Requieren aprobación"
                        onClick={() => navigate('/admin/pedidos')}
                    />
                    <PendingActionCard
                        tone="azure"
                        icon={<Users className="h-5 w-5" aria-hidden="true" />}
                        value={kpis.isLoading ? '—' : kpis.clientesActivos}
                        label="Clientes activos"
                        hint="Con cuenta habilitada"
                        onClick={() => navigate('/admin/clientes')}
                    />
                    <PendingActionCard
                        tone="rose"
                        icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
                        value={kpis.isLoading ? '—' : formatCLP(kpis.porCobrar)}
                        label="Clientes morosos"
                        hint={`${kpis.isLoading ? '—' : kpis.clientesMorosos} por cobrar`}
                        onClick={() => navigate('/admin/clientes')}
                    />
                    <PendingActionCard
                        tone="neutral"
                        icon={<FileText className="h-5 w-5" aria-hidden="true" />}
                        value={kpis.cotizacionesDisponible ? String(kpis.cotizacionesPendientes ?? 0) : '—'}
                        label="Cotizaciones pendientes"
                        hint={kpis.cotizacionesDisponible ? 'Por revisar' : 'Pendiente backend'}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ResumenStock />
                    <ResumenVencimientos />
                </div>

                <ResumenMorosos />
            </div>
        </PageWrapper>
    );
}
