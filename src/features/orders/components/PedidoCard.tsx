// features/orders/components/PedidoCard.tsx
// T2.10 — Fila/tarjeta de un pedido en la lista. Muestra nº, fecha, estado (badge), total
// y enlace al detalle. Presentacional: recibe el Pedido ya mapeado.

import { Link } from 'react-router';
import type { Pedido } from '@/types/models';
import { formatCLP } from '@/utils/formatCurrency';
import { EstadoBadge } from './EstadoBadge';

const fmtFecha = (iso?: string) =>
    iso
        ? new Date(iso).toLocaleDateString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '—';

export function PedidoCard({ pedido }: { pedido: Pedido }) {
    const items = pedido.detalles?.length ?? 0;

    return (
        <Link
            to={`/cliente/pedidos/${pedido.id}`}
            className="group flex items-center gap-4 px-6 py-4 hover:bg-grape-50/60 transition-colors"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                    <span className="font-display font-bold text-plum-700 text-[18px]">
                        Pedido #{pedido.id}
                    </span>
                    <EstadoBadge estado={pedido.estado} />
                </div>
                <p className="mt-1 text-[13px] text-grape-500">
                    {fmtFecha(pedido.fechaCreacion)} · {items}{' '}
                    {items === 1 ? 'producto' : 'productos'}
                    {pedido.sucursalNombre ? ` · ${pedido.sucursalNombre}` : ''}
                </p>
            </div>

            <div className="text-right shrink-0">
                <p className="font-display font-bold text-plum-700 text-[18px]">
                    {formatCLP(pedido.total)}
                </p>
                <span className="text-[12.5px] text-azure-600 font-semibold group-hover:text-plum-700">
                    Ver detalle →
                </span>
            </div>
        </Link>
    );
}
