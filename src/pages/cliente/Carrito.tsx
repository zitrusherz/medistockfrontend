// src/pages/cliente/Carrito.tsx
// T2.7 — Página del carrito (evolución de OrderPage de pedido.jsx).
// Compone: QuickAdd (aside) + líneas (CartRow) + resumen (CartSummary, M2).
// Nota: el SideNav de la maqueta era navegación de marketing → es responsabilidad del
// layout, no del carrito; se omite a propósito para no duplicar navegación.

import { Link } from 'react-router';
import { useCartItems, useCartCount } from '@/features/cart/hooks/useCart';
import { QuickAdd, CartRow, CartSummary } from '@/features/cart/components';

export default function Carrito() {
    const items = useCartItems();
    const count = useCartCount();
    const vacio = items.length === 0;

    return (
        <main className="mx-auto max-w-[1280px] px-5 py-8 grid lg:grid-cols-[300px_1fr] gap-6">
            <aside>
                <QuickAdd />
            </aside>

            <section>
                <nav className="text-[12.5px] text-grape-500 mb-4 flex items-center gap-1.5">
                    <Link to="/" className="hover:text-plum-700">Inicio</Link>
                    <span className="text-grape-300">/</span>
                    <span className="text-plum-700 font-semibold">Mi pedido</span>
                </nav>

                <div className="flex items-center justify-between mb-5">
                    <h1 className="font-display font-bold text-plum-700 text-[30px] flex items-center gap-3">
                        Mi pedido
                        <span className="text-[13px] font-sans font-bold bg-grape-50 text-grape-700 px-2.5 py-1 rounded-full">
                            {count} artículos
                        </span>
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
                    <div className="h-1.5 gold-rule" />
                    {vacio ? (
                        <div className="px-6 py-20 text-center">
                            <p className="font-display font-bold text-plum-700 text-[24px]">Tu pedido está vacío</p>
                            <p className="mt-2 text-[14px] text-grape-600">
                                Agrega productos con su código desde el panel de la izquierda, o explora el{' '}
                                <Link to="/catalogo" className="text-azure-600 hover:text-plum-700 font-semibold">catálogo</Link>.
                            </p>
                        </div>
                    ) : (
                        <div className="px-6 divide-y divide-grape-100">
                            {items.map((it) => <CartRow key={it.code} item={it} />)}
                        </div>
                    )}
                </div>

                {!vacio && <CartSummary />}
            </section>
        </main>
    );
}
