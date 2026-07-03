// src/components/layout/AuthLayout.tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthLayoutProps extends HTMLAttributes<HTMLElement> {
    /** Ancho del card (clases Tailwind). */
    cardWidth?: string
    /** Marca/logo sobre el card. */
    brand?: ReactNode
    /** Contenido dentro del card. */
    children: ReactNode
    /** Decoración/ilustración lateral (solo desktop). */
    aside?: ReactNode
    /**
     * Barra superior opcional (ej. `<AuthTopbar />`) para "continuar" el
     * navbar público en pantallas de autenticación. Opcional y hacia atrás
     * compatible: si no se pasa, el layout se ve exactamente igual que antes
     * (login/registro sin cambios).
     */
    topbar?: ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export const AuthLayout = forwardRef<HTMLElement, AuthLayoutProps>(
    (
        {
            cardWidth = "w-full max-w-sm",
            brand,
            children,
            aside,
            topbar,
            className,
            ...rest
        },
        ref
    ) => {
        return (

            <div className="min-h-screen bg-surface-muted flex flex-col">
                {topbar}

                <main
                    ref={ref as React.Ref<HTMLElement>}
                    className={cn("flex flex-1", className)}
                    {...rest}
                >
                    {/* Columna del formulario */}
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
                        {brand && <div className="mb-8 flex justify-center">{brand}</div>}

                        <div
                            className={cn(
                                cardWidth,
                                "rounded-xl border border-border bg-surface p-8 shadow-card"
                            )}
                        >
                            {children}
                        </div>
                    </div>

                    {/* Columna decorativa — oculta en móvil */}
                    {aside && (
                        <div
                            className="hidden lg:flex flex-1 items-center justify-center bg-primary p-12"
                            aria-hidden="true"
                        >
                            {aside}
                        </div>
                    )}
                </main>
            </div>
        )
    }
)

AuthLayout.displayName = "AuthLayout"

export type { AuthLayoutProps }