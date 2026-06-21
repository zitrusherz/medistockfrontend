import { useCallback, useEffect, useRef, useState, type ReactNode, type JSX } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/utils/cn.ts"
import { ToastContext } from "./toastContext"
import type { ToastInput, ToastItem, ToastVariant, ToastPosition } from "./toastContext"

// ─── Estilos ─────────────────────────────────────────────────────────────────
// Tokens de estado; "error" mapea a danger.

const variantStyles: Record<ToastVariant, { container: string; icon: string }> = {
    info: { container: "border-info/30 bg-surface", icon: "text-info" },
    success: { container: "border-success/30 bg-surface", icon: "text-success" },
    warning: { container: "border-warning/30 bg-surface", icon: "text-warning" },
    error: { container: "border-danger/30 bg-surface", icon: "text-danger" },
    default: { container: "border-info/30 bg-surface", icon: "text-info" },
    destructive: { container: "border-danger/30 bg-surface", icon: "text-danger" },
}

const positionStyles: Record<ToastPosition, string> = {
    "top-right": "top-4 right-4 items-end",
    "top-left": "top-4 left-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
}

// ─── Íconos ──────────────────────────────────────────────────────────────────

const Icons: Record<ToastVariant, JSX.Element> = {
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
    ),
    default: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
    ),
    destructive: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
    ),
}

// ─── Toast individual ──────────────────────────────────────────────────────────

function ToastElement({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
    const variant = item.variant ?? "default"
    const s = variantStyles[variant]
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const duration = item.duration ?? 4000
        if (duration > 0) {
            timerRef.current = setTimeout(() => onDismiss(item.id), duration)
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [item.id, item.duration, onDismiss])

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "flex w-80 max-w-full items-start gap-3 rounded-lg border px-4 py-3 shadow-lift transition-all duration-300",
                s.container,
            )}
        >
            <div className={cn("mt-0.5 shrink-0", s.icon)}>{Icons[variant]}</div>

            <div className="min-w-0 flex-1">
                {item.title && <p className="text-sm font-semibold text-text">{item.title}</p>}
                <p className="text-sm text-text-muted">{item.message ?? item.description ?? ""}</p>
            </div>

            <button
                type="button"
                onClick={() => onDismiss(item.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}

// ─── Provider ──────────────────────────────────────────────────────────────────

interface ToastProviderProps {
    children: ReactNode
    position?: ToastPosition
}

export function ToastProvider({ children, position = "top-right" }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const dismissAll = useCallback(() => setToasts([]), [])

    const toast = useCallback((item: ToastInput): string => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        setToasts((prev) => [...prev, { ...item, variant: item.variant ?? "default", id }])
        return id
    }, [])

    return (
        <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
            {children}
            {createPortal(
                <div
                    aria-live="polite"
                    aria-atomic="false"
                    className={cn("pointer-events-none fixed z-50 flex flex-col gap-2", positionStyles[position])}
                >
                    {toasts.map((item) => (
                        <div key={item.id} className="pointer-events-auto">
                            <ToastElement item={item} onDismiss={dismiss} />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    )
}

// Re-export de tipos para mantener `index.ts` (los valores/contexto viven en toastContext.tsx).
export type { ToastItem, ToastVariant, ToastPosition } from "./toastContext"