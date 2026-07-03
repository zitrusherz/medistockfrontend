

import { useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import type { Pago, MetodoPago } from '@/types/models';

const LABEL_METODO: Record<MetodoPago, string> = {
    WEBPAY: 'Webpay',
    MERCADOPAGO: 'MercadoPago',
    TRANSFERENCIA: 'Transferencia',
    CREDITO_INSTITUCIONAL: 'Crédito inst.',
};

// Familias de estado para los KPIs (vista financiera, no técnica).
const ESTADOS_PENDIENTES = ['PENDIENTE', 'INICIADO', 'AUTORIZADO'] as const;
const ESTADOS_FALLIDOS = ['RECHAZADO', 'ANULADO', 'ERROR'] as const;

interface KpiTone {
    tone: 'success' | 'warning' | 'danger' | 'info';
}

function KpiCard({
    label,
    valor,
    sub,
    tone = 'info',
}: { label: string; valor: string; sub?: string } & Partial<KpiTone>) {
    const borde: Record<NonNullable<KpiTone['tone']>, string> = {
        success: 'border-l-success',
        warning: 'border-l-warning',
        danger: 'border-l-danger',
        info: 'border-l-info',
    };

    return (
        <Card className={`border-l-4 ${borde[tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-text">{valor}</p>
            {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
        </Card>
    );
}

export function PagosKpis({ pagos }: { pagos: Pago[] }) {
    const kpis = useMemo(() => {
        const confirmados = pagos.filter((p) => p.estadoPago === 'CONFIRMADO');
        const recaudado = confirmados.reduce((s, p) => s + p.montoConfirmado, 0);

        const pendientes = pagos.filter((p) =>
            (ESTADOS_PENDIENTES as readonly string[]).includes(p.estadoPago),
        );
        const fallidos = pagos.filter((p) =>
            (ESTADOS_FALLIDOS as readonly string[]).includes(p.estadoPago),
        );
        const montoPendiente = pendientes.reduce((s, p) => s + p.pedidoTotal, 0);

        // Recaudado por método (solo CONFIRMADO = dinero real ingresado).
        const porMetodo = new Map<MetodoPago, number>();
        for (const p of confirmados) {
            porMetodo.set(p.metodoPago, (porMetodo.get(p.metodoPago) ?? 0) + p.montoConfirmado);
        }

        return {
            total: pagos.length,
            recaudado,
            confirmadosCount: confirmados.length,
            pendientesCount: pendientes.length,
            montoPendiente,
            fallidosCount: fallidos.length,
            porMetodo: [...porMetodo.entries()].sort((a, b) => b[1] - a[1]),
        };
    }, [pagos]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    label="Recaudado"
                    valor={formatCLP(kpis.recaudado)}
                    sub={`${kpis.confirmadosCount} confirmados`}
                    tone="success"
                />
                <KpiCard
                    label="Por confirmar"
                    valor={formatCLP(kpis.montoPendiente)}
                    sub={`${kpis.pendientesCount} pendientes`}
                    tone="warning"
                />
                <KpiCard
                    label="Rechazados / anulados"
                    valor={String(kpis.fallidosCount)}
                    sub="transacciones sin cobro"
                    tone="danger"
                />
                <KpiCard
                    label="Transacciones"
                    valor={String(kpis.total)}
                    sub="en la vista actual"
                    tone="info"
                />
            </div>

            {kpis.porMetodo.length > 0 && (
                <Card>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Recaudado por método
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                        {kpis.porMetodo.map(([metodo, monto]) => (
                            <div key={metodo}>
                                <p className="text-sm text-text-muted">{LABEL_METODO[metodo]}</p>
                                <p className="font-display text-lg font-bold text-text">
                                    {formatCLP(monto)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
