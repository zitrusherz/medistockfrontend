// src/pages/cliente/MisPedidos.tsx
// T2.10 — Lista de pedidos del cliente. Estilo alineado con Carrito/Checkout
// (card blanca + gold-rule, breadcrumb, header). La lógica vive en el hook;
// la página solo compone estados (loading / empty / error / datos).

import { Link } from 'react-router';
import { Spinner } from '@/components/ui';
import { useMisPedidos } from '@/features/orders/hooks/useMisPedidos';
import { PedidoCard } from '@/features/orders/components/PedidoCard';

export default function MisPedidos() {
    const { pedidos, isLoading, isEmpty, isError } = useMisPedidos();

    return (
        <main className="mx-auto max-w-[1280px] px-5 py-8">
            <nav className="text-[12.5px] text-grape-500 mb-4 flex items-center gap-1.5">
                <Link to="/" className="hover:text-plum-700">
                    Inicio
                </Link>
                <span className="text-grape-300">/</span>
                <span className="text-plum-700 font-semibold">Mis pedidos</span>
            </nav>

            <div className="flex items-center justify-between mb-5">
                <h1 className="font-display font-bold text-plum-700 text-[30px] flex items-center gap-3">
                    Mis pedidos
                    {!isLoading && !isError && (
                        <span className="text-[13px] font-sans font-bold bg-grape-50 text-grape-700 px-2.5 py-1 rounded-full">
                            {pedidos.length}{' '}
                            {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                        </span>
                    )}
                </h1>
            </div>

            <div className="bg-white rounded-2xl shadow-card ring-gold overflow-hidden">
                <div className="h-1.5 gold-rule" />

                {isLoading ? (
                    <div className="px-6 py-20 flex justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : isError ? (
                    <div className="px-6 py-20 text-center">
                        <p className="font-display font-bold text-plum-700 text-[22px]">
                            No pudimos cargar tus pedidos
                        </p>
                        <p className="mt-2 text-[14px] text-grape-600">
                            Revisa tu conexión e inténtalo de nuevo en unos segundos.
                        </p>
                    </div>
                ) : isEmpty ? (
                    <div className="px-6 py-20 text-center">
                        <p className="font-display font-bold text-plum-700 text-[24px]">
                            Aún no tienes pedidos
                        </p>
                        <p className="mt-2 text-[14px] text-grape-600">
                            Cuando hagas tu primera compra aparecerá aquí. Explora el{' '}
                            <Link
                                to="/catalogo"
                                className="text-azure-600 hover:text-plum-700 font-semibold"
                            >
                                catálogo
                            </Link>
                            .
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-grape-100">
                        {pedidos.map((p) => (
                            <PedidoCard key={p.id} pedido={p} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
