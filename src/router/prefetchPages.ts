// src/router/prefetchPages.ts
import type { Rol } from "@/types/roles"


const pageWarmers: Partial<Record<string, () => Promise<unknown>>> = {
    // Cliente
    "/cliente":          () => import("@/pages/cliente/Dashboard"),
    "/cliente/pedidos":  () => import("@/pages/cliente/MisPedidos"),
    "/cliente/pagos":    () => import("@/pages/cliente/MisPagos"),

    // Ejecutivo de Cuentas
    "/ejecutivo":         () => import("@/pages/ejecutivo/Dashboard"),
    "/ejecutivo/pedidos": () => import("@/pages/ejecutivo/Pedidos"),

    // Operador Logístico
    "/logistica":         () => import("@/pages/logistica/Dashboard"),
    "/logistica/ordenes": () => import("@/pages/logistica/Ordenes"),
    "/logistica/alertas": () => import("@/pages/logistica/Alertas"),

    // Analista de Finanzas
    "/analista":       () => import("@/pages/analista/Dashboard"),
    "/analista/pagos": () => import("@/pages/analista/Pagos"),

    // Administrador
    "/admin":              () => import("@/pages/admin/Inicio"),
    "/admin/estadisticas": () => import("@/pages/admin/Estadisticas"),
    "/admin/pedidos":      () => import("@/pages/admin/Pedidos"),
    "/admin/productos":    () => import("@/pages/admin/Productos"),
    "/admin/trabajadores": () => import("@/pages/admin/Trabajadores"),
    "/admin/clientes":     () => import("@/pages/admin/Clientes"),
    "/admin/api-keys":     () => import("@/pages/admin/ApiKeys"),
}

/**
 * Calienta el chunk de una ruta puntual. Idempotente por naturaleza: una
 * segunda llamada a `import()` con el mismo specifier resuelve desde el
 * caché de módulos del navegador/Vite, no vuelve a pedir la red.
 */
export function prefetchPage(path: string): void {
    void pageWarmers[path]?.()
}

/**
 * Calienta TODAS las páginas visibles para un rol. Pensado para llamarse
 * una sola vez, en idle, justo después de montar el panel.
 */
export function prefetchAllForRole(rol: Rol | null, items: { path: string }[]): void {
    if (!rol) return
    items.forEach((item) => prefetchPage(item.path))
}
