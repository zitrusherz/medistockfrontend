

import { Link } from 'react-router';
import { useCartItems } from '@/features/cart/hooks/useCart';
import { CheckoutForm } from '@/features/orders/components/CheckoutForm';

export default function Checkout() {
    const items = useCartItems();
    const vacio = items.length === 0;

    return (
        <main className="mx-auto max-w-[1280px] px-5 py-8">
            <nav className="text-[12.5px] text-grape-500 mb-4 flex items-center gap-1.5">
                <Link to="/" className="hover:text-plum-700">Inicio</Link>
                <span className="text-grape-300">/</span>
                <Link to="/cliente/carrito" className="hover:text-plum-700">Mi pedido</Link>
                <span className="text-grape-300">/</span>
                <span className="text-plum-700 font-semibold">Finalizar</span>
            </nav>

            <h1 className="font-display font-bold text-plum-700 text-[30px] mb-6">Finalizar pedido</h1>

            {vacio ? (
                <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
                    <div className="h-1.5 gold-rule" />
                    <div className="px-6 py-20 text-center">
                        <p className="font-display font-bold text-plum-700 text-[24px]">Tu pedido está vacío</p>
                        <p className="mt-2 text-[14px] text-grape-600">
                            Agrega productos desde el{' '}
                            <Link to="/catalogo" className="text-azure-600 hover:text-plum-700 font-semibold">
                                catálogo
                            </Link>{' '}
                            antes de finalizar.
                        </p>
                    </div>
                </div>
            ) : (
                <CheckoutForm />
            )}
        </main>
    );
}
