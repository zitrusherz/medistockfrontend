import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { homeByRole } from "./homeByRole"
import type { Rol } from "@/types/roles"

interface RoleRouteProps {
    roles: Rol[] // roles permitidos para esta zona
}

/**
 * Guarda 2 — AUTORIZACIÓN (Proxy).
 * Asume sesión ya validada por PrivateRoute (padre).
 *
 * Lee `rol` del store (el campo real es `rol`, NO `usuario`).
 * Rol fuera de la lista → lo manda a SU propio dashboard, no a /unauthorized:
 * un cliente que tropieza con /admin aterriza en /cliente, sin pantalla de error.
 */
export function RoleRoute({ roles }: RoleRouteProps) {
    const rol = useAuthStore((s) => s.rol)

    if (!rol || !roles.includes(rol)) {
        return <Navigate to={homeByRole(rol)} replace />
    }

    return <Outlet />
}