

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatCLP } from '@/utils/formatCurrency';
import { useCartItems, useCartCount, useCartTotal, useCartActions } from '../hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import type { CartItem } from '@/features/cart/types';

const cartIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
    </svg>
);

const minusIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M5 12h14" />
    </svg>
);

const plusIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const xIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

function MiniCartLine({ it }: { it: CartItem }) {
    const { setQty, removeItem } = useCartActions();
    const enTope = it.quantity >= it.stockMax;

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            {/* Thumb */}
            {it.imageUrl ? (
                <img
                    src={it.imageUrl}
                    alt={it.name}
                    className="w-12 h-12 shrink-0 rounded-lg border border-grape-100 object-cover bg-white"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <div
                className={`ph-stripes w-12 h-12 shrink-0 rounded-lg border border-grape-100 ${it.imageUrl ? 'hidden' : ''}`}
                aria-hidden="true"
            />

            {/* Info + stepper */}
            <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-ink truncate">{it.name}</p>
                <p className="text-[11.5px] text-grape-500 mb-1.5">
                    {formatCLP(it.priceIva)} c/u
                </p>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setQty(it.code, it.quantity - 1)}
                        aria-label={`Quitar uno de ${it.name}`}
                        className="grid place-items-center w-6 h-6 rounded-md ring-1 ring-grape-200 text-grape-600 hover:bg-grape-50 hover:text-plum-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
                    >
                        {minusIcon}
                    </button>
                    <span
                        className="min-w-[1.75rem] text-center text-[12px] font-bold text-ink tabular-nums"
                        aria-live="polite"
                    >
                        {it.quantity}
                    </span>
                    <button
                        onClick={() => setQty(it.code, it.quantity + 1)}
                        disabled={enTope}
                        aria-label={`Agregar uno de ${it.name}`}
                        title={enTope ? 'Stock máximo alcanzado' : undefined}
                        className="grid place-items-center w-6 h-6 rounded-md ring-1 ring-grape-200 text-grape-600 hover:bg-grape-50 hover:text-plum-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-grape-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
                    >
                        {plusIcon}
                    </button>
                </div>
            </div>

            {/* Total línea + X */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                    onClick={() => removeItem(it.code)}
                    aria-label={`Eliminar ${it.name} del carrito`}
                    className="grid place-items-center w-5 h-5 rounded-full text-grape-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                    {xIcon}
                </button>
                <span className="text-[13px] font-bold text-plum-700 tabular-nums">
                    {formatCLP(it.priceIva * it.quantity)}
                </span>
            </div>
        </div>
    );
}

export function CartMenu() {
    const items = useCartItems();
    const count = useCartCount();
    const { total } = useCartTotal();
    const isAuth = useAuthStore((s) => s.status === 'authenticated');
    const cartHref = isAuth ? '/cliente/carrito' : '/login';

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const closeTimer = useRef<number | null>(null);

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
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
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
                        <div className="max-h-80 overflow-auto divide-y divide-grape-100">
                            {items.map((it) => (
                                <MiniCartLine key={it.code} it={it} />
                            ))}
                        </div>
                    )}

                    <div className="px-4 py-3 border-t border-grape-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-grape-700">Total estimado</span>
                            <span className="font-display font-bold text-plum-700 text-[20px]">{formatCLP(total)}</span>
                        </div>
                        {/* CAMBIO 1: antes decía "Ver carrito y pedido" → ahora "Ver carrito". */}
                        <Link
                            to={cartHref}
                            onClick={() => setOpen(false)}
                            className="block text-center bg-plum-700 hover:bg-plum-800 text-white font-bold text-[13.5px] py-2.5 rounded-lg ring-1 ring-gold-400/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grape-500"
                        >
                            Ver carrito
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
