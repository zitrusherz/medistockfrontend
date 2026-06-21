// features/admin/charts/VentasBarChart.tsx
// T4.1 — Barras de ventas confirmadas por mes (recharts). Responsive (M14):
// ResponsiveContainer ocupa el ancho del padre. Estado vacío explícito en vez
// de un gráfico roto cuando aún no hay ventas.

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCLP } from '@/utils/formatCurrency';
import type { PuntoMensual } from '../selectors/adminStats';
import { COLOR_AXIS, COLOR_GRID, COLOR_PRIMARY, formatCLPCompact } from './chartTheme';

function GraficoVacio() {
    return (
        <div className="flex h-[280px] items-center justify-center text-sm text-text-muted">
            Aún no hay ventas confirmadas para graficar.
        </div>
    );
}

export function VentasBarChart({ data }: { data: PuntoMensual[] }) {
    const hayVentas = data.some((d) => d.total > 0);
    if (!hayVentas) return <GraficoVacio />;

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: COLOR_AXIS }}
                        tickLine={false}
                        axisLine={{ stroke: COLOR_GRID }}
                    />
                    <YAxis
                        width={56}
                        tick={{ fontSize: 11, fill: COLOR_AXIS }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatCLPCompact(v)}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--color-surface-muted)' }}
                        formatter={(v: number | string | readonly (number | string)[] | undefined) => {
                            const rawValue = Array.isArray(v) ? v[0] : v;

                            return [formatCLP(Number(rawValue ?? 0)), 'Ventas'];
                        }}
                        labelStyle={{ color: 'var(--color-text)' }}
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            fontSize: 12,
                        }}
                    />
                    <Bar dataKey="total" fill={COLOR_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
