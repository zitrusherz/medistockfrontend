import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { homeByRole } from "./homeByRole"
import type { Rol } from "@/types/roles"

interface RoleRouteProps {
    roles: Rol[] // roles permitidos para esta zona
}


export function RoleRoute({ roles }: RoleRouteProps) {
    const rol = useAuthStore((s) => s.rol)

    if (!rol || !roles.includes(rol)) {
        return <Navigate to={homeByRole(rol)} replace />
    }

    return <Outlet />
}