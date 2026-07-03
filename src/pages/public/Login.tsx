

import { Navigate, useLocation } from "react-router"
import { AuthLayout, AuthTopbar, LogoMark } from "@/components/layout"
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

            topbar={<AuthTopbar homePath="/" />}
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
