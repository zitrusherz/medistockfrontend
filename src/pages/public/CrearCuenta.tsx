

import { Link } from 'react-router';
import { Navbar } from '@/components/layout';
import { RegisterForm } from '@/features/accounts/components/RegisterForm';

export default function CrearCuenta() {
    return (
        <>
            {/* ── Navbar simple ───────────────────────────────────────────── */}
            <Navbar
                brand={
                    <Link
                        to="/"
                        aria-label="Ir al inicio de MediStock"
                        className="font-display text-xl font-bold text-plum-700"
                    >
                        Medi<span className="text-gold-gradient">Stock</span>
                    </Link>
                }
                end={
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-grape-600 transition-colors hover:text-plum-700"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M19 12H5" />
                            <path d="m12 19-7-7 7-7" />
                        </svg>
                        Volver al inicio
                    </Link>
                }
            />

            {/* pt-20: deja espacio bajo la navbar fija (h-14). */}
            <main className="mx-auto w-full max-w-3xl px-5 pb-10 pt-20">
                <header className="mb-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
                        Únete a MediStock
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-text">Crear una cuenta</h1>
                    <p className="mt-2 text-sm text-text-muted">
                        Abastece tu centro de salud con precios y despacho preferentes.
                    </p>
                </header>

                <RegisterForm />
            </main>
        </>
    );
}
