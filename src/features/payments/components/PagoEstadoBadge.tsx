// features/payments/components/PagoEstadoBadge.tsx
// T3.7 — Badge de estado de pago para la vista del Analista.
//
// Mapa PROPIO (no reúsa paymentState) a propósito, y por dos razones:
//   1. Consistencia con el repo: EstadoBadge (pedidos) ya tiene su propio mapa.
//   2. Concepto distinto: paymentState traduce el RESULTADO de un commit para el
//      CLIENTE (5 desenlaces). Aquí pintamos el ESTADO CRUDO de la transacción
//      para el ANALISTA (8 estados). El mismo estado puede pedir tonos distintos
//      según la audiencia: para el cliente PENDIENTE = info ("procesando"); para
//      el analista PENDIENTE = warning ("por cobrar"). Un solo mapa no sirve a
//      ambos, así que NO tocamos paymentState (eso cambiaría el tono en PagoRetorno).

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
