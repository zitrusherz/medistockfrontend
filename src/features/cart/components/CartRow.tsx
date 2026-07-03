

import { QtyStepper } from '@/features/catalog/components/QtyStepper';
import { formatCLP } from '@/utils/formatCurrency';
import { useCartActions } from '../hooks/useCart';
import type { CartItem } from '@/features/cart/types';

const trash = (
    <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    </svg>
);

export function CartRow({ item }: { item: CartItem }) {
    const { setQty, removeItem } = useCartActions();
    const lineNeto = item.priceNeto * item.quantity;
    const enTope = item.quantity >= item.stockMax;

    return (
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-grape-100 bg-gray-50">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <div
                    className={`ph-stripes absolute inset-0 grid place-items-center ${item.imageUrl ? 'hidden' : ''}`}
                    aria-hidden={item.imageUrl ? true : undefined}
                >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-grape-700/55">Foto</span>
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <a
                    href={`/producto/${item.code}`}
                    className="text-[15px] font-bold leading-snug text-azure-600 hover:text-plum-700"
                >
                    {item.name}
                </a>
                <p className="mt-1 text-[12.5px] text-grape-600">
                    <span className="font-mono font-semibold text-ink">{item.code}</span>
                    <span className="ml-2 inline-block rounded bg-grape-50 px-1.5 py-0.5 text-[10.5px] font-bold tracking-wide text-grape-700">
                        {item.unit}
                    </span>
                </p>
            </div>

            <div className="shrink-0 text-right">
                <span className="block text-[11px] text-grape-500">Precio unit. (neto)</span>
                <span className="font-display text-[19px] font-bold text-plum-700">{formatCLP(item.priceNeto)}</span>
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
                    <span className="mt-1 block text-center text-[10.5px] font-semibold text-amber-600">
                        Máx. disponible
                    </span>
                )}
            </div>

            <div className="w-28 shrink-0 text-right">
                <span className="block text-[11px] text-grape-500">Total línea (neto)</span>
                <span className="font-display text-[19px] font-bold text-ink">{formatCLP(lineNeto)}</span>
            </div>

            <button
                onClick={() => removeItem(item.code)}
                className="shrink-0 p-2 text-grape-400 hover:text-rose-600"
                aria-label={`Quitar ${item.name}`}
            >
                {trash}
            </button>
        </div>
    );
}