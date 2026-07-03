

import { Avatar } from '@/components/ui';
import { formatCLP } from '@/utils/formatCurrency';
import type { CompradorRanking } from '../hooks/useTopCompradores';

interface TopBuyersProps {
    ranking: CompradorRanking[];
    loading?: boolean;
    /** Cuántos mostrar (ranking ya viene ordenado desc). */
    limit?: number;
}

export function TopBuyers({ ranking, loading = false, limit = 10 }: TopBuyersProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-12 animate-pulse rounded-lg bg-surface-muted"
                    />
                ))}
            </div>
        );
    }

    if (ranking.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-text-muted">
                Aún no hay compras registradas para rankear.
            </p>
        );
    }

    const top = ranking.slice(0, limit);
    const max = top[0]?.total ?? 0; // ranking ordenado desc → el primero es el mayor

    return (
        <ol className="flex flex-col gap-3">
            {top.map((c, i) => {
                // mínimo 4% para que una barra no quede invisible.
                const pct = max > 0 ? Math.max(4, Math.round((c.total / max) * 100)) : 0;
                const podio = i < 3;

                return (
                    <li key={c.clienteId} className="flex items-center gap-3">
                        <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                podio
                                    ? 'bg-gold-200 text-gold-600'
                                    : 'bg-surface-muted text-text-muted'
                            }`}
                        >
                            {i + 1}
                        </span>

                        <Avatar name={c.nombre} size="sm" />

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <span className="truncate text-sm font-semibold text-text">
                                    {c.nombre}
                                </span>
                                <span className="shrink-0 text-sm font-bold text-text">
                                    {formatCLP(c.total)}
                                </span>
                            </div>

                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            <span className="mt-0.5 block text-xs text-text-muted">
                                {c.pedidos} {c.pedidos === 1 ? 'pedido' : 'pedidos'}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
