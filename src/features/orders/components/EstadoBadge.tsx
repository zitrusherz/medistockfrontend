// features/orders/components/EstadoBadge.tsx
// T2.10 — State pattern hecho visual: cada EstadoPedido mapea a un pill con su label
// y sus clases de token. Única fuente de verdad del look de estado en el feature.

import type { EstadoPedido } from '../types';

const MAPA: Record<EstadoPedido, { label: string; classes: string }> = {
    PENDIENTE: { label: 'Pendiente', classes: 'bg-warning-soft text-warning' },
    APROBADO: { label: 'Aprobado', classes: 'bg-info-soft text-info' },
    EN_PICKING: { label: 'En preparación', classes: 'bg-gold-200 text-gold-600' },
    DESPACHADO: { label: 'Despachado', classes: 'bg-grape-100 text-azure-700' },
    ENTREGADO: { label: 'Entregado', classes: 'bg-success-soft text-success' },
    RECHAZADO: { label: 'Rechazado', classes: 'bg-danger-soft text-danger' },
    CANCELADO: { label: 'Cancelado', classes: 'bg-grape-100 text-grape-500' },
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
    const { label, classes } = MAPA[estado] ?? {
        label: estado,
        classes: 'bg-grape-100 text-grape-600',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${classes}`}
        >
            {label}
        </span>
    );
}
