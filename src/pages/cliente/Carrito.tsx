

import { Link } from 'react-router';
import { useCartItems, useCartCount } from '@/features/cart/hooks/useCart';
import { QuickAdd, CartRow, CartSummary } from '@/features/cart/components';

export default function Carrito() {
    const items = useCartItems();
    const count = useCartCount();
    const vacio = items.length === 0;


    const cols = vacio
        ? 'lg:grid-cols-[280px_minmax(0,1fr)]'
        : 'lg:grid-cols-[280px_minmax(0,1fr)_300px]';

    return (
        <div className="mx-auto max-w-[1280px] px-5 py-8">
            {/* Breadcrumb a lo ancho (fuera de la grilla) */}
            <nav className="text-[12.5px] text-grape-500 mb-4 flex items-center gap-1.5">
                <Link to="/" className="hover:text-plum-700">Inicio</Link>
                <span className="text-grape-300">/</span>
                <span className="text-plum-700 font-semibold">Mi pedido</span>
            </nav>

            {/* Título a lo ancho (fuera de la grilla): así las tarjetas laterales
                quedan alineadas por el tope con la tarjeta del pedido. */}
            <div className="flex items-center gap-3 mb-5">
                <h1 className="font-display font-bold text-plum-700 text-[30px]">Mi pedido</h1>
                <span className="text-[13px] font-sans font-bold bg-grape-50 text-grape-700 px-2.5 py-1 rounded-full">
                    {count} artículos
                </span>
            </div>

            <div className={`grid gap-6 items-start ${cols}`}>
                {/* Columna 1: alta rápida de suministros */}
                <aside>
                    <QuickAdd />
                </aside>

                {/* Columna 2: pedido */}
                <section>
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
                </section>

                {/* Columna 3: resumen (solo si hay pedido) */}
                {!vacio && (
                    <aside>
                        <CartSummary />
                    </aside>
                )}
            </div>
        </div>
    );
}
