// src/features/cart/components/CartSummary.tsx
// T2.7 · M2 — Desglose neto / IVA 19% / total ESTIMADO.
// "Estimado" porque el total real lo fija el pedido en el backend (T2.8); aquí mostramos
// la proyección a partir de los precios capturados en cada línea (useCartTotal → calcTotales).
// Patrón Observer: lee selectores del cartStore; recalcula solo al cambiar items.

import { useNavigate } from 'react-router';
import { formatCLP } from '@/utils/formatCurrency';
import { useCartTotal, useCartCount, useCartActions } from '../hooks/useCart';

export function CartSummary() {
    const navigate = useNavigate();
    const { neto, iva, total } = useCartTotal();
    const count = useCartCount();
    const { clear } = useCartActions();

    return (
        <div className="mt-5 flex flex-col gap-4 bg-white rounded-2xl shadow-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <button
                    onClick={clear}
                    className="text-[13.5px] font-semibold text-grape-600 hover:text-rose-600 self-start"
                >
                    Vaciar carrito
                </button>

                <div className="w-full sm:w-72 space-y-1.5">
                    <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                        <span>Neto ({count} art.)</span>
                        <span className="font-semibold text-ink">{formatCLP(neto)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13.5px] text-grape-700">
                        <span>IVA (19%)</span>
                        <span className="font-semibold text-ink">{formatCLP(iva)}</span>
                    </div>
                    <div className="h-px gold-rule my-1" />
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-grape-700">Total estimado</span>
                        <span className="font-display font-bold text-plum-700 text-[28px] leading-none">
                            {formatCLP(total)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => navigate('/cliente/checkout')}
                    className="bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3.5 rounded-lg shadow-lift transition-colors"
                >
                    Finalizar pedido
                </button>
            </div>
        </div>
    );
}
