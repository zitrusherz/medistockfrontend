import type { HTMLAttributes } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
    /** 0-100 */
    value?: number
    /** Indeterminado = barra animada (ignora value) */
    indeterminate?: boolean
    variant?: "primary" | "success" | "warning" | "danger"
    size?: "xs" | "sm" | "md" | "lg"
    /** Muestra el porcentaje */
    showLabel?: boolean
    label?: string
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const fillColors = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
}

const trackSizes = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function ProgressBar({
                                value = 0,
                                indeterminate = false,
                                variant = "primary",
                                size = "md",
                                showLabel = false,
                                label,
                                className,
                                ...rest
                            }: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
        <div className={cn("w-full", className)} {...rest}>
            {(label || showLabel) && (
                <div className="mb-1.5 flex items-center justify-between">
                    {label && <span className="text-xs font-medium text-text-muted">{label}</span>}
                    {showLabel && !indeterminate && (
                        <span className="text-xs font-medium text-text-muted">{clampedValue}%</span>
                    )}
                </div>
            )}

            <div
                role="progressbar"
                aria-valuenow={indeterminate ? undefined : clampedValue}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label ?? "Progreso"}
                className={cn("w-full overflow-hidden rounded-full bg-surface-muted", trackSizes[size])}
            >
                {indeterminate ? (
                    <div
                        className={cn(
                            "h-full w-full origin-left rounded-full",
                            fillColors[variant],
                            "animate-[indeterminate_1.5s_ease-in-out_infinite]",
                        )}
                        style={{
                            background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.2) 10px,
                rgba(255,255,255,0.2) 20px
              )`,
                        }}
                    />
                ) : (
                    <div
                        className={cn("h-full rounded-full transition-all duration-500 ease-out", fillColors[variant])}
                        style={{ width: `${clampedValue}%` }}
                    />
                )}
            </div>
        </div>
    )
}

export type { ProgressBarProps }