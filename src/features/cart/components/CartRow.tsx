// src/features/cart/components/CartRow.tsx
// T2.7 — Línea del carrito (evolución de CartRow + Stepper de pedido.jsx).
// Decisión de reutilización (IL3.1): en vez de crear un nuevo ui/Stepper, REUSAMOS el
// QtyStepper ya existente del feature catálogo. Tiene exactamente la API que necesitamos
// (value/onChange/min/max/disabled/unit) y `max={stockMax}` aplica el tope de stock (M3).
// El store además vuelve a clampar en setQty, así que el límite queda asegurado por partida doble.

import { QtyStepper } from '@/features/catalog/components/QtyStepper';
import { formatCLP } from '@/utils/formatCurrency';
import { useCartActions } from '../hooks/useCart';
import type { CartItem } from '@/features/cart/types';

const trash = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    </svg>
);

export function CartRow({ item }: { item: CartItem }) {
    const { setQty, removeItem } = useCartActions();
    const lineNeto = item.priceNeto * item.quantity;
    const enTope = item.quantity >= item.stockMax;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-5">
            <div className="ph-stripes w-20 h-20 shrink-0 rounded-lg border border-grape-100 grid place-items-center">
                <span className="font-mono text-[10px] uppercase tracking-wider text-grape-700/55">Foto</span>
            </div>

            <div className="flex-1 min-w-0">
                <a
                    href={`/producto/${item.code}`}
                    className="text-[15px] font-bold text-azure-600 hover:text-plum-700 leading-snug"
                >
                    {item.name}
                </a>
                <p className="mt-1 text-[12.5px] text-grape-600">
                    <span className="font-mono font-semibold text-ink">{item.code}</span>
                    <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-grape-50 text-[10.5px] font-bold tracking-wide text-grape-700">
                        {item.unit}
                    </span>
                </p>
            </div>

            <div className="text-right shrink-0">
                <span className="block text-[11px] text-grape-500">Precio unit. (neto)</span>
                <span className="font-display font-bold text-plum-700 text-[19px]">{formatCLP(item.priceNeto)}</span>
                <span className="block text-[10.5px] text-grape-500">{formatCLP(item.priceIva)} c/IVA</span>
            </div>

            <div className="shrink-0">
                <QtyStepper
                    value={item.quantity}
                    onChange={(q) => setQty(item.code, q)}
                    min={1}
                    max={item.stockMax}
                />
                {enTope && (
                    <span className="mt-1 block text-[10.5px] font-semibold text-amber-600 text-center">
                        Máx. disponible
                    </span>
                )}
            </div>

            <div className="text-right w-28 shrink-0">
                <span className="block text-[11px] text-grape-500">Total línea (neto)</span>
                <span className="font-display font-bold text-ink text-[19px]">{formatCLP(lineNeto)}</span>
            </div>

            <button
                onClick={() => removeItem(item.code)}
                className="shrink-0 text-grape-400 hover:text-rose-600 p-2"
                aria-label={`Quitar ${item.name}`}
            >
                {trash}
            </button>
        </div>
    );
}
