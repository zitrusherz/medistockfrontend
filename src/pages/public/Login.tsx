// src/pages/public/Login.tsx — ruta: /login
// Apéndice D #1 — Aloja el formulario de login y rebota si ya hay sesión.
// Container: solo compone AuthLayout + LoginForm; el 401 y el redirect post-éxito
// los maneja useLogin (T1.4). Si el usuario llegó desde una ruta protegida,
// PrivateRouter guardó `state.from`; volvemos ahí tras autenticar.

import { Navigate, useLocation } from "react-router"
import { AuthLayout, LogoMark } from "@/components/layout"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useAuthStore } from "@/store/authStore"
import { homeByRole } from "@/router/homeByRole"

export default function Login() {
    const status = useAuthStore((s) => s.status)
    const rol = useAuthStore((s) => s.rol)
    const location = useLocation()

    // Ya autenticado: no mostrar el form. Vuelve a `from` o al home del rol.
    if (status === "authenticated") {
        const from = (location.state as { from?: { pathname?: string } } | null)
            ?.from?.pathname
        return <Navigate to={from ?? homeByRole(rol)} replace />
    }

    return (
        <AuthLayout
            // Marca visible sobre fondo claro (LogoMark es texto blanco → solo en el aside oscuro).
            brand={
                <span className="font-display text-2xl font-bold text-plum-700">
                    Medi<span className="text-gold-gradient">Stock</span>
                </span>
            }
            aside={
                <div className="text-center">
                    <LogoMark caption="PLATAFORMA CLÍNICA" />
                    <p className="mt-6 max-w-xs text-sm text-white/70">
                        Catálogo en tiempo real, pedidos y trazabilidad para tu
                        institución.
                    </p>
                </div>
            }
        >
            <LoginForm />
        </AuthLayout>
    )
}
