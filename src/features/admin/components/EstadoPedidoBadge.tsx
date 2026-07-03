

import { Badge } from '@/components/ui';
import type { BadgeVariant } from '@/components/ui';
import type { EstadoPedido } from '@/types/models';

const MAPA: Record<EstadoPedido, { label: string; variant: BadgeVariant }> = {
    PENDIENTE: { label: 'Pendiente', variant: 'warning' },
    APROBADO: { label: 'Aprobado', variant: 'success' },
    EN_PICKING: { label: 'En picking', variant: 'default' },
    DESPACHADO: { label: 'Despachado', variant: 'default' },
    ENTREGADO: { label: 'Entregado', variant: 'success' },
    RECHAZADO: { label: 'Rechazado', variant: 'danger' },
    CANCELADO: { label: 'Cancelado', variant: 'danger' },
};

export function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
    const e = MAPA[estado] ?? { label: estado, variant: 'default' as BadgeVariant };
    return (
        <Badge variant={e.variant} size="sm">
            {e.label}
        </Badge>
    );
}
