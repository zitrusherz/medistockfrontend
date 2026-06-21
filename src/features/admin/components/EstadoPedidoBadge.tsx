// features/admin/components/EstadoPedidoBadge.tsx
// T4.1 — Badge de estado de pedido con etiqueta es-CL y tono coherente. Se usa
// en las tablas de pedidos recientes y en los resúmenes de Inicio.

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
