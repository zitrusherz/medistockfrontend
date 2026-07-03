

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabList, Tab, Button } from '@/components/ui';
import { OrdersTable } from '@/features/orders/components/OrdersTable';
import { OrderModal } from '@/features/orders/components/OrderModal';
import { useTodosPedidos } from '@/features/orders/hooks/useTodosPedidos';
import { ordenarColaLogistica } from '@/features/logistics/services/colaPrioridad';
import type { Pedido } from '@/types/models';
import type { EstadoPedido } from '@/features/orders/types';

type TabKey = 'POR_PREPARAR' | 'EN_CURSO' | 'TODOS';

/** Estados que ya salieron de la cola "por preparar" pero siguen en operación. */
const EN_CURSO: EstadoPedido[] = ['EN_PICKING', 'DESPACHADO'];

const TABS: { key: TabKey; label: string }[] = [
    { key: 'POR_PREPARAR', label: 'Por preparar' },
    { key: 'EN_CURSO', label: 'En curso' },
    { key: 'TODOS', label: 'Todos' },
];

export default function LogisticaOrdenes() {
    const navigate = useNavigate();
    const { pedidos, isLoading } = useTodosPedidos();
    const [tab, setTab] = useState<TabKey>('POR_PREPARAR');
    const [detalle, setDetalle] = useState<Pedido | null>(null);

    // Logística solo opera de APROBADO en adelante (el resto es del Ejecutivo).
    const relevantes = useMemo(
        () =>
            pedidos.filter(
                (p) => p.estado === 'APROBADO' || EN_CURSO.includes(p.estado),
            ),
        [pedidos],
    );

    const counts = useMemo(
        () => ({
            POR_PREPARAR: relevantes.filter((p) => p.estado === 'APROBADO').length,
            EN_CURSO: relevantes.filter((p) => EN_CURSO.includes(p.estado)).length,
            TODOS: relevantes.length,
        }),
        [relevantes],
    );

    const visibles = useMemo(() => {
        const base =
            tab === 'POR_PREPARAR'
                ? relevantes.filter((p) => p.estado === 'APROBADO')
                : tab === 'EN_CURSO'
                  ? relevantes.filter((p) => EN_CURSO.includes(p.estado))
                  : relevantes;
        return ordenarColaLogistica(base);
    }, [relevantes, tab]);

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Órdenes"
                description="Cola priorizada por urgencia médica. Prepara y despacha los pedidos aprobados."
                breadcrumb={[
                    { label: 'Inicio', href: '/logistica' },
                    { label: 'Órdenes' },
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
                            <Tab key={t.key} id={t.key} badge={counts[t.key]}>
                                {t.label}
                            </Tab>
                        ))}
                    </TabList>
                </Tabs>

                <OrdersTable
                    pedidos={visibles}
                    loading={isLoading}
                    emptyText="No hay pedidos en esta cola."
                    renderAcciones={(p) => (
                        <>
                            {p.estado === 'APROBADO' && (
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    onClick={() =>
                                        navigate(`/logistica/preparacion/${p.id}`)
                                    }
                                >
                                    Preparar
                                </Button>
                            )}
                            {(p.estado === 'APROBADO' || p.estado === 'EN_PICKING') && (
                                <Button
                                    size="xs"
                                    variant="primary"
                                    onClick={() => navigate(`/logistica/envio/${p.id}`)}
                                >
                                    Despachar
                                </Button>
                            )}
                            {p.estado === 'DESPACHADO' && (
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    onClick={() => navigate(`/logistica/envio/${p.id}`)}
                                >
                                    Seguimiento
                                </Button>
                            )}
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setDetalle(p)}
                            >
                                Ver
                            </Button>
                        </>
                    )}
                />
            </div>

            <OrderModal
                pedido={detalle ?? undefined}
                open={detalle !== null}
                onClose={() => setDetalle(null)}
            />
        </PageWrapper>
    );
}
