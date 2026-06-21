import type { HTMLAttributes } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SpinnerProps extends HTMLAttributes<SVGElement> {
    size?: "xs" | "sm" | "md" | "lg" | "xl"
    /** Variante de color */
    variant?: "primary" | "white" | "muted"
    /** Etiqueta para lector de pantalla */
    label?: string
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
}

const colors = {
    primary: "text-primary",
    white: "text-white",
    muted: "text-text-muted",
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Spinner({ size = "md", variant = "primary", label = "Cargando…", className, ...rest }: SpinnerProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="status"
            aria-label={label}
            className={cn("animate-spin", sizes[size], colors[variant], className)}
            {...rest}
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    )
}

export type { SpinnerProps }