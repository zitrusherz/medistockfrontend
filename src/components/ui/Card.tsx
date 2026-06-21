import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type CardVariant = "default" | "outlined" | "filled" | "elevated"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant
    /** Sombra + leve elevación al hover — útil para cards clickeables */
    hoverable?: boolean
    /** Quita el padding (usá CardBody para el contenido) */
    noPadding?: boolean
    children: ReactNode
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    /** Contenido alineado a la derecha (acciones, badge) */
    action?: ReactNode
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
// Tokens semánticos + sombras de marca (shadow-card / shadow-lift) del index.css.

const variantStyles: Record<CardVariant, string> = {
    default: "bg-surface border border-border shadow-card",
    outlined: "bg-surface border-2 border-border",
    filled: "bg-surface-muted border border-border",
    elevated: "bg-surface border border-border shadow-lift",
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = "default", hoverable = false, noPadding = false, className, children, ...rest }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-lg overflow-hidden transition-all duration-200",
                variantStyles[variant],
                hoverable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lift",
                !noPadding && "p-5",
                className,
            )}
            {...rest}
        >
            {children}
        </div>
    )
)
Card.displayName = "Card"

// ─── CardHeader ──────────────────────────────────────────────────────────────

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ children, action, className, ...rest }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-3", className)}
            {...rest}
        >
            <div className="min-w-0 flex-1">{children}</div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    )
)
CardHeader.displayName = "CardHeader"

// ─── CardBody ────────────────────────────────────────────────────────────────

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
    ({ children, className, ...rest }, ref) => (
        <div ref={ref} className={cn("px-5 py-3", className)} {...rest}>
            {children}
        </div>
    )
)
CardBody.displayName = "CardBody"

// ─── CardFooter ──────────────────────────────────────────────────────────────

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ children, className, ...rest }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center gap-3 border-t border-border px-5 pt-3 pb-5", className)}
            {...rest}
        >
            {children}
        </div>
    )
)
CardFooter.displayName = "CardFooter"

export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps, CardVariant }