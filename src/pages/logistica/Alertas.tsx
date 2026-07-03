

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StockAlertsView } from '@/features/inventory/components/StockAlertsView';
import { ExpiryAlertsView } from '@/features/inventory/components/ExpiryAlertsView';

type Vista = 'stock' | 'vencimiento';

const TABS: { id: Vista; label: string }[] = [
    { id: 'stock', label: 'Stock bajo mínimo' },
    { id: 'vencimiento', label: 'Próximos a vencer' },
];

export default function Alertas() {
    const [vista, setVista] = useState<Vista>('stock');

    return (
        <div className="space-y-6">
            <PageHeader
                title="Alertas de inventario"
                description="Control de stock por sucursal y vencimientos por lote."
                breadcrumb={[{ label: 'Logística' }, { label: 'Alertas' }]}
            />

            <div
                role="tablist"
                aria-label="Tipo de alerta"
                className="inline-flex rounded-xl border border-border bg-surface p-1 shadow-card"
            >
                {TABS.map((t) => {
                    const activo = vista === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={activo}
                            onClick={() => setVista(t.id)}
                            className={[
                                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                activo ? 'bg-primary text-surface shadow-sm' : 'text-text-muted hover:text-text',
                            ].join(' ')}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {vista === 'stock' ? <StockAlertsView /> : <ExpiryAlertsView />}
        </div>
    );
}
