import { Roles, type Rol } from "@/types/roles"

/**
 * Ruta "home" de cada rol. Una sola fuente de verdad.
 * La usan: RoleRoute (rol incorrecto → su propio dashboard) y
 * useLogin (T1.4: redirección tras login exitoso).
 *
 * Archivo aparte (no en index.tsx) para evitar el ciclo de imports
 * index.tsx → RoleRoute → index.tsx.
 */
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