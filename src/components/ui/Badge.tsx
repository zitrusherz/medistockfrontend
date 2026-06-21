import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from  "@/utils/cn.ts"

// ─── Tipos ─────────────────────────────────────────────────────────────────

type BadgeVariant =
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"

type BadgeSize = "sm" | "md" | "lg"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
    size?: BadgeSize
    /** Muestra un punto de color antes del texto */
    dot?: boolean
    /** Muestra el botón × y llama a onRemove */
    removable?: boolean
    onRemove?: () => void
    children: ReactNode
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
// Token-agnósticos: usan tokens semánticos (surface/primary/success…), nunca la
// paleta cruda (sky/slate/emerald). Cambiar el tema = cambiar variables, no este
// archivo. Las opacidades (/10, /20) derivan el borde y el fondo del mismo token.

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
    default: { badge: "bg-surface-muted text-text border-border", dot: "bg-text-muted" },
    primary: { badge: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
    success: { badge: "bg-success-soft text-success-strong border-success/20", dot: "bg-success" },
    warning: { badge: "bg-warning-soft text-warning-strong border-warning/20", dot: "bg-warning" },
    danger:  { badge: "bg-danger-soft text-danger-strong border-danger/20", dot: "bg-danger" },
    info:    { badge: "bg-info-soft text-info-strong border-info/20", dot: "bg-info" },
    neutral: { badge: "bg-text text-surface border-text", dot: "bg-surface/70" },
}

const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-0.5 text-xs gap-1.5",
    lg: "px-2.5 py-1 text-sm gap-1.5",
}

const dotSizes: Record<BadgeSize, string> = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            variant = "default",
            size = "md",
            dot = false,
            removable = false,
            onRemove,
            className,
            children,
            ...rest
        },
        ref
    ) => {
        const s = variantStyles[variant]

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center font-medium rounded-full border leading-none",
                    s.badge,
                    sizeStyles[size],
                    className, // ← el consumidor gana
                )}
                {...rest}
            >
                {dot && (
                    <span
                        aria-hidden="true"
                        className={cn("shrink-0 rounded-full", s.dot, dotSizes[size])}
                    />
                )}

                {children}

                {removable && (
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label="Eliminar"
                        className="ml-0.5 -mr-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-current"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </span>
        )
    }
)

Badge.displayName = "Badge"

export type { BadgeProps, BadgeVariant, BadgeSize }