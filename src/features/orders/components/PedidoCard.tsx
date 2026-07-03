

import { Link } from 'react-router';
import type { Pedido } from '@/types/models';
import { formatCLP } from '@/utils/formatCurrency';
import { puedePagarPedido } from '../services/orderService';
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
    const pagable = puedePagarPedido(pedido);

    return (
        <div className="group relative flex items-center gap-4 px-6 py-4 hover:bg-grape-50/60 transition-colors">
            {/* Stretched link: toda la fila navega al detalle. */}
            <Link
                to={`/cliente/pedidos/${pedido.id}`}
                aria-label={`Ver detalle del pedido #${pedido.id}`}
                className="absolute inset-0"
            />

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

            {/* z-10: por encima del stretched link para capturar su propio clic. */}
            <div className="relative z-10 flex shrink-0 flex-col items-end gap-1.5 text-right">
                <p className="font-display font-bold text-plum-700 text-[18px]">
                    {formatCLP(pedido.total)}
                </p>
                {pagable ? (
                    <Link
                        to={`/cliente/pago/${pedido.id}`}
                        className="rounded-lg bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 px-4 py-1.5 text-[13px] font-extrabold text-plum-800 shadow-lift transition-colors"
                    >
                        Pagar
                    </Link>
                ) : (
                    <span className="text-[12.5px] text-azure-600 font-semibold group-hover:text-plum-700">
                        Ver detalle →
                    </span>
                )}
            </div>
        </div>
    );
}
