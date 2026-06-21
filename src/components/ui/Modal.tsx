// src/components/ui/Modal.tsx
// T5.1 / M13 — ÚNICO cambio respecto al original: ahora el Modal DEVUELVE el foco
// al elemento que lo tenía antes de abrirse (al cerrar/desmontar). Ya tenía
// role="dialog", aria-modal, cierre con Escape y focus-trap con Tab; faltaba el
// retorno de foco, que es lo que pedía la pasada de accesibilidad.

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg" | "xl" | "full"

interface ModalProps {
    open: boolean
    onClose: () => void
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
    size?: ModalSize
    children: ReactNode
    /** Título accesible (para aria-labelledby si usás ModalHeader con id) */
    titleId?: string
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const ModalContext = createContext<{ onClose: () => void } | null>(null)

// ─── Tamaños ─────────────────────────────────────────────────────────────────

const sizeMap: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full m-4",
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function Modal({
                          open,
                          onClose,
                          closeOnOverlay = true,
                          closeOnEscape = true,
                          size = "md",
                          children,
                          titleId,
                      }: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null)

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

    // M13 — Retorno de foco: capturamos el elemento activo al abrir y lo
    // restauramos en el cleanup (cuando `open` pasa a false o el Modal se
    // desmonta). Así, tras cerrar un OrderModal/StatModal, el foco vuelve al
    // botón que lo abrió y no se pierde al <body>.
    useEffect(() => {
        if (!open) return
        const previouslyFocused = document.activeElement as HTMLElement | null
        return () => {
            previouslyFocused?.focus?.()
        }
    }, [open])

    // Foco inicial: primer elemento enfocable dentro del panel.
    useEffect(() => {
        if (!open) return
        const el = panelRef.current
        if (!el) return
        const focusable = el.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        focusable[0]?.focus()
    }, [open])

    function handleOverlay(e: MouseEvent<HTMLDivElement>) {
        if (closeOnOverlay && e.target === e.currentTarget) onClose()
    }

    // Focus-trap: Tab/Shift+Tab quedan dentro del panel.
    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key !== "Tab") return
        const el = panelRef.current
        if (!el) return
        const focusable = Array.from(
            el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
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

    if (!open) return null

    return createPortal(
        <ModalContext.Provider value={{ onClose }}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={handleOverlay}
                onKeyDown={handleKeyDown}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" aria-hidden="true" />

                {/* Panel */}
                <div ref={panelRef} className={cn("relative z-10 w-full rounded-xl bg-surface shadow-lift", sizeMap[size])} tabIndex={-1}>
                    {children}
                </div>
            </div>
        </ModalContext.Provider>,
        document.body
    )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

interface ModalHeaderProps {
    children: ReactNode
    id?: string
}

export function ModalHeader({ children, id }: ModalHeaderProps) {
    const ctx = useContext(ModalContext)

    return (
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <h2 id={id} className="text-base font-semibold leading-snug text-text">
                {children}
            </h2>
            {ctx && (
                <button
                    type="button"
                    onClick={ctx.onClose}
                    aria-label="Cerrar"
                    className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    )
}

export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("px-6 py-4", className)}>{children}</div>
}

export function ModalFooter({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-border bg-surface-muted px-6 py-4">
            {children}
        </div>
    )
}

export type { ModalProps, ModalSize }
