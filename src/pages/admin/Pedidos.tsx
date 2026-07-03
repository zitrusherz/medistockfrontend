

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabList, Tab, Button } from '@/components/ui';
import { OrdersTable } from '@/features/orders/components/OrdersTable';
import { OrderModal } from '@/features/orders/components/OrderModal';
import { RechazoModal } from '@/features/orders/components/RechazoModal';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import { useAccionesPedido } from '@/features/orders/hooks/useAccionesPedido';
import type { Pedido } from '@/types/models';
import type { EstadoPedido } from '@/features/orders/types';

type TabKey = 'TODOS' | Extract<EstadoPedido, 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>;

const TABS: { key: TabKey; label: string }[] = [
    { key: 'PENDIENTE', label: 'Pendientes' },
    { key: 'APROBADO', label: 'Aprobados' },
    { key: 'RECHAZADO', label: 'Rechazados' },
    { key: 'TODOS', label: 'Todos' },
];

export default function AdminPedidos() {
    const { pedidos, isLoading } = useTodosPedidos();
    const { aprobar, rechazar } = useAccionesPedido();

    const [tab, setTab] = useState<TabKey>('PENDIENTE');
    const [detalle, setDetalle] = useState<Pedido | null>(null);
    const [aRechazar, setARechazar] = useState<Pedido | null>(null);

    // Contadores por estado para los badges de las pestañas.
    const counts = useMemo(() => {
        const c: Record<string, number> = { TODOS: pedidos.length };
        for (const p of pedidos) c[p.estado] = (c[p.estado] ?? 0) + 1;
        return c;
    }, [pedidos]);

    const visibles = useMemo(
        () => (tab === 'TODOS' ? pedidos : pedidos.filter((p) => p.estado === tab)),
        [pedidos, tab],
    );

    const accionesEnCurso = aprobar.isPending || rechazar.isPending;

    function confirmarRechazo(comentario: string) {
        if (!aRechazar) return;
        rechazar.mutate(
            { id: aRechazar.id, comentario },
            { onSuccess: () => setARechazar(null) },
        );
    }

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Pedidos"
                description="Revisa, aprueba o rechaza pedidos de toda la operación."
                breadcrumb={[
                    { label: 'Inicio', href: '/admin' },
                    { label: 'Pedidos' },
                ]}
            />

            <div className="mt-6 space-y-5">
                <Tabs
                    variant="pills"
                    activeTab={tab}
                    onTabChange={(id) => setTab(id as TabKey)}
                >
                    <TabList>
                        {TABS.map((t) => (
                            <Tab key={t.key} id={t.key} badge={counts[t.key] ?? 0}>
                                {t.label}
                            </Tab>
                        ))}
                    </TabList>
                </Tabs>

                <OrdersTable
                    pedidos={visibles}
                    loading={isLoading}
                    emptyText="No hay pedidos en este estado."
                    renderAcciones={(p) => (
                        <>
                            {p.estado === 'PENDIENTE' && (
                                <>
                                    <Button
                                        size="xs"
                                        variant="success"
                                        loading={
                                            aprobar.isPending &&
                                            aprobar.variables?.id === p.id
                                        }
                                        disabled={accionesEnCurso}
                                        onClick={() => aprobar.mutate({ id: p.id })}
                                    >
                                        Aprobar
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="danger"
                                        disabled={accionesEnCurso}
                                        onClick={() => setARechazar(p)}
                                    >
                                        Rechazar
                                    </Button>
                                </>
                            )}
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setDetalle(p)}
                            >
                                Detalles
                            </Button>
                        </>
                    )}
                />
            </div>

            {/* Detalle (solo lectura desde aquí; aprobar/rechazar viven en la fila) */}
            <OrderModal
                pedido={detalle ?? undefined}
                open={detalle !== null}
                onClose={() => setDetalle(null)}
            />

            {/* Rechazo con motivo obligatorio */}
            <RechazoModal
                open={aRechazar !== null}
                pedidoId={aRechazar?.id}
                loading={rechazar.isPending}
                onClose={() => setARechazar(null)}
                onConfirm={confirmarRechazo}
            />
        </PageWrapper>
    );
}
