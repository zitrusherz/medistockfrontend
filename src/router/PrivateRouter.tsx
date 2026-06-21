import { Navigate, Outlet, useLocation } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { Spinner } from "@/components/ui"

/**
 * Guarda 1 — AUTENTICACIÓN (Proxy).
 * ¿Hay sesión? No mira roles, eso es RoleRoute.
 *
 * Lee `status` (no isAuthenticated()) porque necesita distinguir
 * "todavía validando" de "no hay sesión":
 *   idle | loading → spinner   (App.tsx/T1.7 está revalidando el token)
 *   guest          → /login
 *   authenticated  → Outlet
 *
 * Si redirigiera en idle/loading, el usuario vería un flash de /login
 * al recargar antes de aterrizar en su dashboard.
 */
export function PrivateRoute() {
    const status   = useAuthStore((s) => s.status)
    const location = useLocation()

    if (status === "idle" || status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    if (status === "guest") {
        // `from` permite volver a donde iba tras loguear (lo usa useLogin)
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}