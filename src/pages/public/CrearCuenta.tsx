import { RegisterForm } from '@/features/accounts/components/RegisterForm';

/**
 * Página pública de registro de cliente (ruta /crear-cuenta).
 * Solo compone el encabezado + el RegisterForm; toda la lógica vive en
 * features/accounts (useRegisterForm + RegisterForm).
 */
export default function CrearCuenta() {
    return (
        <main className="mx-auto w-full max-w-3xl px-5 py-10">
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
    );
}
