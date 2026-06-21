import { forwardRef, useState, type HTMLAttributes, type ReactElement } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
type AvatarStatus = "online" | "offline" | "busy" | "away"

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
    /** URL de la imagen */
    src?: string
    /** Texto alt y fuente de las iniciales de respaldo */
    name?: string
    size?: AvatarSize
    /** Punto indicador de estado */
    status?: AvatarStatus
    /** Forma */
    rounded?: "full" | "md"
}

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Máximo de avatares antes del contador +N */
    max?: number
    children: ReactElement<AvatarProps>[]
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const sizeMap: Record<AvatarSize, { container: string; text: string; status: string }> = {
    xs: { container: "h-6 w-6", text: "text-[10px]", status: "h-1.5 w-1.5 -bottom-0 -right-0" },
    sm: { container: "h-8 w-8", text: "text-xs", status: "h-2 w-2 bottom-0 right-0" },
    md: { container: "h-10 w-10", text: "text-sm", status: "h-2.5 w-2.5 bottom-0 right-0" },
    lg: { container: "h-12 w-12", text: "text-base", status: "h-3 w-3 bottom-0.5 right-0.5" },
    xl: { container: "h-16 w-16", text: "text-xl", status: "h-3.5 w-3.5 bottom-0.5 right-0.5" },
    "2xl": { container: "h-20 w-20", text: "text-2xl", status: "h-4 w-4 bottom-1 right-1" },
}

// Estado mapeado a tokens semánticos (no a emerald/amber/red crudos).
const statusColors: Record<AvatarStatus, string> = {
    online: "bg-success",
    offline: "bg-text-muted",
    busy: "bg-danger",
    away: "bg-warning",
}

// ─── Iniciales ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return (parts[0]?.[0] ?? "").toUpperCase()
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

// ─── Color de fondo determinístico desde el nombre ─────────────────────────────
// Paleta DECORATIVA (no semántica): se arma con las familias de la marca para no
// introducir colores ajenos (sky/slate). Todos los tonos son suficientemente
// oscuros para texto blanco.

const BG_PALETTE = [
    "bg-plum-600",
    "bg-plum-700",
    "bg-grape-600",
    "bg-grape-700",
    "bg-azure-600",
    "bg-azure-700",
    "bg-gold-600",
    "bg-primary",
]

function nameToColor(name: string): string {
    const code = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return BG_PALETTE[code % BG_PALETTE.length] ?? "bg-primary"
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
    ({ src, name = "", size = "md", status, rounded = "full", className, ...rest }, ref) => {
        const [imgError, setImgError] = useState(false)
        const s = sizeMap[size]
        const showImage = src && !imgError
        const initials = getInitials(name)
        const bg = nameToColor(name)
        const shape = rounded === "full" ? "rounded-full" : "rounded-md"

        return (
            <span
                ref={ref}
                className={cn(
                    "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
                    s.container,
                    shape,
                    !showImage ? `${bg} font-semibold text-white` : "bg-surface-muted",
                    className,
                )}
                aria-label={name || "Avatar"}
                {...rest}
            >
                {showImage ? (
                    <img
                        src={src}
                        alt={name}
                        className="h-full w-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className={s.text} aria-hidden="true">
                        {initials || "?"}
                    </span>
                )}

                {/* Punto de estado */}
                {status && (
                    <span
                        aria-label={status}
                        className={cn(
                            "absolute block rounded-full ring-2 ring-surface",
                            s.status,
                            statusColors[status],
                        )}
                    />
                )}
            </span>
        )
    }
)
Avatar.displayName = "Avatar"

// ─── AvatarGroup ─────────────────────────────────────────────────────────────

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
    ({ max = 4, children, className, ...rest }, ref) => {
        const visible = children.slice(0, max)
        const overflow = children.length - max

        return (
            <div ref={ref} className={cn("flex -space-x-3", className)} {...rest}>
                {visible.map((child, i) => (
                    // Clonado con ring para el efecto de apilado
                    <span key={i} className="rounded-full ring-2 ring-surface">
                        {child}
                    </span>
                ))}

                {overflow > 0 && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-sm font-medium text-text-muted ring-2 ring-surface">
                        +{overflow}
                    </span>
                )}
            </div>
        )
    }
)
AvatarGroup.displayName = "AvatarGroup"

export type { AvatarProps, AvatarGroupProps, AvatarSize, AvatarStatus }