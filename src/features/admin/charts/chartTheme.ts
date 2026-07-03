

export const CHART_PALETTE = [
    'var(--color-plum-700)',
    'var(--color-azure-600)',
    'var(--color-gold-500)',
    'var(--color-plum-500)',
    'var(--color-azure-700)',
    'var(--color-grape-500)',
    'var(--color-success)',
    'var(--color-warning)',
];

export const COLOR_PRIMARY = 'var(--color-primary)';
export const COLOR_GRID = 'var(--color-border)';
export const COLOR_AXIS = 'var(--color-text-muted)';

/** CLP compacto para ejes: $1,2M · $320K · $900. */
export function formatCLPCompact(value: number): string {
    if (!Number.isFinite(value)) return '$0';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
    if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`;
    return `$${value}`;
}
