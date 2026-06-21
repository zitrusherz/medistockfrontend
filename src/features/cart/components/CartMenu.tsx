// src/features/cart/components/CartMenu.tsx
// T2.7 — Mini-carrito del navbar (contrato visual: CartMenu de components.jsx).
// El BADGE refleja `count` en vivo vía useCartCount (Observer): cualquier add/setQty/remove
// en cualquier pantalla lo actualiza sin props. Pensado para el slot del header.
//
// Apertura: HOVER en desktop (onMouseEnter/Leave con un pequeño retardo para poder
// cruzar el espacio entre el botón y el panel sin que se cierre) + CLICK (táctil)
// + FOCO de teclado. Cierre: salir del área, click-fuera o Escape (devolviendo el
// foco al botón). (T5.1 / M13).

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatCLP } from '@/utils/formatCurrency';
import { useCartItems, useCartCount, useCartTotal } from '../hooks/useCart';

const cartIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
    </svg>
);

export function CartMenu() {
    const items = useCartItems();
    const count = useCartCount();
    const { total } = useCartTotal();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const closeTimer = useRef<number | null>(null);

    // Hover con retardo: al salir, esperamos un poco antes de cerrar para que se
    // pueda mover el cursor del botón al panel (cruzando el espacio entre ambos).
    const cancelClose = () => {
        if (closeTimer.current !== null) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };
    const openNow = () => {
        cancelClose();
        setOpen(true);
    };
    const closeSoon = () => {
        cancelClose();
        closeTimer.current = window.setTimeout(() => setOpen(false), 140);
    };

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            // click-fuera: cerrar sin tocar el foco.
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            // Escape: cerrar y DEVOLVER el foco al disparador (M13).
            if (e.key === 'Escape' && open) {
                setOpen(false);
                btnRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
            cancelClose();
        };
    }, [open]);

    return (
        <div
            className="relative"
            ref={ref}
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
        >
            <button
                ref={btnRef}
                onClick={() => setOpen((o) => !o)}
                onFocus={openNow}
                aria-label={`Carrito, ${count} artículos`}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="relative flex items-center gap-1.5 rounded-md px-2 py-1 text-grape-700 transition-colors hover:text-plum-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
            >
                {cartIcon}
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-grape-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 grid place-items-center rounded-full">
                        {count}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Mini carrito"
                    className="absolute right-0 top-[calc(100%+12px)] w-[340px] bg-white rounded-xl shadow-lift ring-1 ring-gold-300/70 z-50 overflow-hidden"
                >
                    <div className="h-1.5 gold-rule" />
                    <div className="px-4 py-3 flex items-center justify-between border-b border-grape-100">
                        <span className="font-display font-bold text-plum-700 text-[18px]">Mi carrito</span>
                        <span className="text-[12px] font-semibold text-gold-600">{count} artículos</span>
                    </div>

                    {items.length === 0 ? (
                        <p className="px-4 py-8 text-center text-[13px] text-grape-500">Tu carrito está vacío.</p>
                    ) : (
                        <div className="max-h-72 overflow-auto divide-y divide-grape-100">
                            {items.map((it) => (
                                <div key={it.code} className="flex items-center gap-3 px-4 py-3">
                                    <div className="ph-stripes w-12 h-12 shrink-0 rounded-lg border border-grape-100" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12.5px] font-semibold text-ink truncate">{it.name}</p>
                                        <p className="text-[11.5px] text-grape-500">
                                            {it.quantity} × {formatCLP(it.priceIva)}
                                        </p>
                                    </div>
                                    <span className="text-[13px] font-bold text-plum-700">
                                        {formatCLP(it.priceIva * it.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="px-4 py-3 border-t border-grape-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-grape-700">Total estimado</span>
                            <span className="font-display font-bold text-plum-700 text-[20px]">{formatCLP(total)}</span>
                        </div>
                        <Link
                            to="/cliente/carrito"
                            onClick={() => setOpen(false)}
                            className="block text-center bg-plum-700 hover:bg-plum-800 text-white font-bold text-[13.5px] py-2.5 rounded-lg ring-1 ring-gold-400/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
                        >
                            Ver carrito y pedido
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
