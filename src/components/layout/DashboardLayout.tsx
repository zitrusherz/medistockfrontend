import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardLayoutProps extends HTMLAttributes<HTMLDivElement> {
    /** Navbar ya renderizado. */
    navbar: ReactNode
    /** Sidebar ya renderizado. */
    sidebar: ReactNode
    /** Si el sidebar está colapsado (controla el offset del main en lg+). */
    sidebarCollapsed?: boolean
    /** Ancho expandido (valor CSS; debe coincidir con la prop `width` del Sidebar). */
    sidebarWidth?: string
    /** Ancho colapsado (valor CSS; debe coincidir con `collapsedWidth` del Sidebar). */
    sidebarCollapsedWidth?: string
    children: ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────


export const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(
    (
        {
            navbar,
            sidebar,
            sidebarCollapsed = false,
            sidebarWidth = "15rem",          // coincide con Sidebar w-60
            sidebarCollapsedWidth = "4rem",  // coincide con Sidebar w-16
            className,
            children,
            ...rest
        },
        ref
    ) => {
        const sidebarW = sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth

        return (
            <div ref={ref} className={cn("min-h-screen bg-surface-muted", className)} {...rest}>
                {/* Barra superior fija */}
                {navbar}

                {/* Barra lateral fija */}
                {sidebar}

                {/* Contenido scrolleable — offset por navbar (pt-14) y sidebar (solo lg+) */}
                <div
                    className="flex flex-col min-h-screen pt-14 transition-[margin-left] duration-300 lg:ml-[var(--sidebar-w)]"
                    style={{ "--sidebar-w": sidebarW } as CSSProperties}
                >
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </div>
            </div>
        )
    }
)

DashboardLayout.displayName = "DashboardLayout"

export type { DashboardLayoutProps }