import {
    useEffect,
    useRef,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DrawerPlacement = "left" | "right" | "top" | "bottom"

interface DrawerProps {
    open: boolean
    onClose: () => void
    placement?: DrawerPlacement
    /** Ancho (left/right) o alto (top/bottom) */
    size?: string
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
    children: ReactNode
    title?: string
}

// ─── Estilos por posición ──────────────────────────────────────────────────────

const placementStyles: Record<
    DrawerPlacement,
    { panel: string; open: string; closed: string }
> = {
    left: { panel: "top-0 left-0 h-full", open: "translate-x-0", closed: "-translate-x-full" },
    right: { panel: "top-0 right-0 h-full", open: "translate-x-0", closed: "translate-x-full" },
    top: { panel: "top-0 left-0 w-full", open: "translate-y-0", closed: "-translate-y-full" },
    bottom: { panel: "bottom-0 left-0 w-full", open: "translate-y-0", closed: "translate-y-full" },
}

// ─── Componente ──────────────────────────────────────────────────────────────
// Nota: mantiene su propio panelRef (necesario para el focus-trap), por eso no
// usa forwardRef hacia afuera. Es un overlay controlado, no una primitiva de
// layout reutilizable.

export function Drawer({
                           open,
                           onClose,
                           placement = "right",
                           size,
                           closeOnOverlay = true,
                           closeOnEscape = true,
                           children,
                           title,
                       }: DrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null)
    const p = placementStyles[placement]

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden"
        else document.body.style.overflow = ""
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    useEffect(() => {
        if (!open || !closeOnEscape) return
        function handle(e: globalThis.KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handle)
        return () => document.removeEventListener("keydown", handle)
    }, [open, closeOnEscape, onClose])

    useEffect(() => {
        if (open) panelRef.current?.focus()
    }, [open])

    function handleOverlay(e: MouseEvent<HTMLDivElement>) {
        if (closeOnOverlay && e.target === e.currentTarget) onClose()
    }

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key !== "Tab") return
        const el = panelRef.current
        if (!el) return
        const focusable = Array.from(
            el.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        ).filter((f) => !f.getAttribute("disabled"))

        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first?.focus()
        }
    }

    // Default responsive: en left/right limita el ancho en pantallas chicas.
    const sizeStyle =
        size ?? (placement === "left" || placement === "right" ? "w-80 max-w-[90vw]" : "h-64")

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
            onClick={handleOverlay}
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop */}
            <div
                aria-hidden="true"
                className={cn(
                    "absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0",
                )}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                tabIndex={-1}
                className={cn(
                    "absolute z-10 flex flex-col bg-surface shadow-lift transition-transform duration-300 focus:outline-none",
                    p.panel,
                    sizeStyle,
                    open ? p.open : p.closed,
                )}
            >
                {/* Header por defecto si hay title */}
                {title && (
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="text-base font-semibold text-text">{title}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>,
        document.body
    )
}

export type { DrawerProps, DrawerPlacement }