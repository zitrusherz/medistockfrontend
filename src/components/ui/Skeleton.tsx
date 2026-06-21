import type { HTMLAttributes } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    /** Forma */
    variant?: "text" | "rect" | "circle"
    /** Ancho (valor CSS o utilidad de Tailwind) */
    width?: string
    /** Alto (valor CSS) — para rect/circle */
    height?: string
    /** Cantidad de líneas (solo variant="text") */
    lines?: number
}

// ─── Base ────────────────────────────────────────────────────────────────────

const base = "animate-pulse rounded bg-surface-muted"

// ─── Componente ──────────────────────────────────────────────────────────────

export function Skeleton({ variant = "rect", width, height, lines = 3, className, style, ...rest }: SkeletonProps) {
    if (variant === "text") {
        return (
            <div className={cn("flex flex-col gap-2", className)} {...rest}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(base, "h-4 rounded")}
                        style={{
                            width: i === lines - 1 && lines > 1 ? "65%" : width ?? "100%",
                        }}
                    />
                ))}
            </div>
        )
    }

    if (variant === "circle") {
        const size = height ?? width ?? "2.5rem"
        return (
            <div
                className={cn(base, "rounded-full", className)}
                style={{ width: size, height: size, ...style }}
                aria-hidden="true"
                {...rest}
            />
        )
    }

    // rect (default)
    return (
        <div
            className={cn(base, className)}
            style={{ width: width ?? "100%", height: height ?? "1rem", ...style }}
            aria-hidden="true"
            {...rest}
        />
    )
}

// ─── Preset de card ────────────────────────────────────────────────────────────

export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <Skeleton variant="rect" height="10rem" className="mb-4" />
            <Skeleton variant="text" lines={2} className="mb-3" />
            <div className="flex items-center gap-3">
                <Skeleton variant="circle" width="2rem" height="2rem" />
                <Skeleton variant="text" lines={1} width="60%" />
            </div>
        </div>
    )
}

export type { SkeletonProps }