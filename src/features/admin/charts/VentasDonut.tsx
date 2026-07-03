

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCLP } from '@/utils/formatCurrency';
import type { RebanadaCategoria } from '../selectors/adminStats';
import { CHART_PALETTE } from './chartTheme';

function GraficoVacio() {
    return (
        <div className="flex h-[280px] items-center justify-center text-sm text-text-muted">
            Aún no hay ventas para desglosar.
        </div>
    );
}

export function VentasDonut({ data }: { data: RebanadaCategoria[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total <= 0 || data.length === 0) return <GraficoVacio />;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-[220px] w-full max-w-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={92}
                            paddingAngle={2}
                            stroke="var(--color-surface)"
                            strokeWidth={2}
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(v: number | string | readonly (number | string)[] | undefined) => {
                                const rawValue = Array.isArray(v) ? v[0] : v;
                                return [formatCLP(Number(rawValue ?? 0)), 'Ventas'];
                            }}
                            contentStyle={{
                                borderRadius: 8,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                fontSize: 12,
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] uppercase tracking-wide text-text-muted">Total</span>
                    <span className="font-display text-base font-bold text-text">
                        {formatCLP(total)}
                    </span>
                </div>
            </div>

            {/* Leyenda con monto y % (más legible que la leyenda nativa). */}
            <ul className="w-full flex-1 space-y-2">
                {data.map((d, i) => (
                    <li key={d.label} className="flex items-center gap-2 text-sm">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                            aria-hidden="true"
                        />
                        <span className="flex-1 truncate text-text">{d.label}</span>
                        <span className="font-medium text-text">{formatCLP(d.value)}</span>
                        <span className="w-12 text-right text-xs text-text-muted">
                            {Math.round((d.value / total) * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
