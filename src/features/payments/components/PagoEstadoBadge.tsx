

import { Badge } from '@/components/ui';
import type { BadgeVariant } from '@/components/ui';
import type { EstadoPago } from '@/types/models';

const MAPA: Record<EstadoPago, { label: string; variant: BadgeVariant }> = {
    CONFIRMADO:  { label: 'Confirmado',  variant: 'success' },
    AUTORIZADO:  { label: 'Autorizado',  variant: 'info' },
    INICIADO:    { label: 'Iniciado',    variant: 'info' },
    PENDIENTE:   { label: 'Pendiente',   variant: 'warning' },
    ANULADO:     { label: 'Anulado',     variant: 'warning' },
    REEMBOLSADO: { label: 'Reembolsado', variant: 'neutral' },
    RECHAZADO:   { label: 'Rechazado',   variant: 'danger' },
    ERROR:       { label: 'Error',       variant: 'danger' },
};

export function PagoEstadoBadge({ estado }: { estado: EstadoPago }) {
    const { label, variant } = MAPA[estado] ?? {
        label: estado,
        variant: 'default' as BadgeVariant,
    };

    return (
        <Badge variant={variant} size="sm" dot>
            {label}
        </Badge>
    );
}
