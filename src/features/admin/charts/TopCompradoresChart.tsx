

import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCLP } from '@/utils/formatCurrency';
import type { FilaTopComprador } from '../selectors/adminStats';
import { CHART_PALETTE, COLOR_AXIS, formatCLPCompact } from './chartTheme';

function GraficoVacio() {
    return (
        <div className="flex h-[200px] items-center justify-center text-sm text-text-muted">
            Aún no hay compras registradas.
        </div>
    );
}

export function TopCompradoresChart({ data }: { data: FilaTopComprador[] }) {
    if (data.length === 0) return <GraficoVacio />;

    const altura = Math.max(200, data.length * 38);

    return (
        <div className="w-full" style={{ height: altura }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                    <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: COLOR_AXIS }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatCLPCompact(v)}
                    />
                    <YAxis
                        type="category"
                        dataKey="cliente"
                        width={140}
                        tick={{ fontSize: 11, fill: COLOR_AXIS }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--color-surface-muted)' }}
                        formatter={(v: number | string | readonly (number | string)[] | undefined) => {
                            // If Recharts passes an array (e.g., in a range chart), grab the first item
                            const rawValue = Array.isArray(v) ? v[0] : v;

                            // Fallback to 0 if it's undefined
                            return [formatCLP(Number(rawValue ?? 0)), 'Comprado'];
                        }}
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            fontSize: 12,
                        }}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={26}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
