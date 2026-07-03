import { Roles, type Rol } from "@/types/roles"


export const homeByRole = (rol: Rol | null): string => {
    if (!rol) return "/"

    const homes: Record<Rol, string> = {
        [Roles.ADMINISTRADOR]:      "/admin",
        [Roles.EJECUTIVO]:          "/ejecutivo",
        [Roles.OPERADOR_LOGISTICO]: "/logistica",
        [Roles.ANALISTA]:           "/analista",
        [Roles.CLIENTE]:            "/cliente",
    }
    return homes[rol] ?? "/"
}