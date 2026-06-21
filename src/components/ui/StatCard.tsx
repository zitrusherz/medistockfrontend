// components/ui/StatCard.tsx
// T4.1 — Tarjeta de KPI reutilizable. Unifica los KpiCard locales que vivían
// sueltos en PagosKpis y Cobranza (una sola primitiva por concepto). Soporta
// tono (borde izquierdo), subtítulo, icono y una tendencia opcional (% vs algo).
// Estado loading con Skeleton (M12). Montos se pasan ya formateados por el padre.

import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

export type StatTone =
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';

export interface StatTrend {
    /** Porcentaje (ej. 12.4 o -3.1). */
    value: number;
    /** Texto a la derecha del %, ej. "vs mes anterior". */
    label?: string;
}

export interface StatCardProps {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    tone?: StatTone;
    icon?: ReactNode;
    loading?: boolean;
    trend?: StatTrend | null;
    className?: string;
}

const BORDE: Record<StatTone, string> = {
    primary: 'border-l-primary',
    success: 'border-l-success',
    warning: 'border-l-warning',
    danger: 'border-l-danger',
    info: 'border-l-info',
    neutral: 'border-l-border',
};

function Trend({ trend }: { trend: StatTrend }) {
    const sube = trend.value >= 0;
    const Icono = sube ? TrendingUp : TrendingDown;
    const color = sube ? 'text-success' : 'text-danger';
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
            <Icono className="h-3.5 w-3.5" aria-hidden="true" />
            {sube ? '+' : ''}
            {trend.value}%
            {trend.label && (
                <span className="font-normal text-text-muted">{trend.label}</span>
            )}
        </span>
    );
}

export function StatCard({
    label,
    value,
    sub,
    tone = 'info',
    icon,
    loading = false,
    trend,
    className = '',
}: StatCardProps) {
    return (
        <Card className={`border-l-4 ${BORDE[tone]} ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {label}
                </p>
                {icon && <span className="shrink-0 text-text-muted">{icon}</span>}
            </div>

            {loading ? (
                <Skeleton className="mt-2 h-8 w-24" />
            ) : (
                <p className="mt-1 font-display text-2xl font-bold text-text">{value}</p>
            )}

            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {sub && !loading && <span className="text-xs text-text-muted">{sub}</span>}
                {trend && !loading && <Trend trend={trend} />}
            </div>
        </Card>
    );
}
