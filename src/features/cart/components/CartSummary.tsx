// src/features/cart/components/CartSummary.tsx
// T2.7 · M2 — Desglose neto / IVA 19% / total ESTIMADO.
// "Estimado" porque el total real lo fija el pedido en el backend (T2.8); aquí mostramos
// la proyección a partir de los precios capturados en cada línea (useCartTotal → calcTotales).
// Patrón Observer: lee selectores del cartStore; recalcula solo al cambiar items.
//
// CAMBIO 4: se reordena a tarjeta LATERAL vertical (columna derecha del carrito),
//           sticky y alineada con el pedido. Antes era una barra apilada abajo con
//           los totales y el botón en horizontal.

import { useNavigate } from 'react-router';
import { formatCLP } from '@/utils/formatCurrency';
import { useCartTotal, useCartCount, useCartActions } from '../hooks/useCart';

export function CartSummary() {
    const navigate = useNavigate();
    const { neto, iva, total } = useCartTotal();
    const count = useCartCount();
    const { clear } = useCartActions();

    return (
        <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden lg:sticky lg:top-6">
            <div className="h-1.5 gold-rule" />
            <div className="p-5">
                <h2 className="font-display font-bold text-plum-700 text-[20px] mb-4">Resumen</h2>

                <div className="space-y-1.5">
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
                        <span className="font-display font-bold text-plum-700 text-[26px] leading-none">
                            {formatCLP(total)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/cliente/checkout')}
                    className="mt-5 w-full bg-gradient-to-r from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-plum-800 font-extrabold text-[15px] px-7 py-3.5 rounded-lg shadow-lift transition-colors"
                >
                    Finalizar pedido
                </button>

                <button
                    onClick={clear}
                    className="mt-3 w-full text-center text-[13.5px] font-semibold text-grape-600 hover:text-rose-600 transition-colors"
                >
                    Vaciar carrito
                </button>
            </div>
        </div>
    );
}
