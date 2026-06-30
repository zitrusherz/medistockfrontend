// src/router/prefetch.ts
import { Roles, type Rol } from "@/types/roles"

// Mismo orden que homeByRole. Dispara el import del dashboard del rol
// para que su chunk esté listo antes de navegar (sin spinner).
const warmers: Record<Rol, () => Promise<unknown>> = {
    [Roles.ADMINISTRADOR]:      () => import("@/pages/admin/Inicio"),
    [Roles.EJECUTIVO]:          () => import("@/pages/ejecutivo/Dashboard"),
    [Roles.OPERADOR_LOGISTICO]: () => import("@/pages/logistica/Dashboard"),
    [Roles.ANALISTA]:           () => import("@/pages/analista/Dashboard"),
    [Roles.CLIENTE]:            () => import("@/pages/cliente/Dashboard"),
}

export const prefetchHome = (rol: Rol | null): void => {
    if (!rol) return
    warmers[rol]?.()
}