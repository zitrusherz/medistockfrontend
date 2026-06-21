import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type PopoverPlacement = "top" | "bottom" | "left" | "right"

interface PopoverContextValue {
    id: string
    open: boolean
    toggle: (triggerEl: HTMLElement) => void
    close: () => void
}

interface PopoverProps {
    placement?: PopoverPlacement
    width?: string
    children: ReactNode
}

interface PopoverTriggerProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode
}

interface PopoverContentProps {
    children: ReactNode
    className?: string
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const PopoverContext = createContext<PopoverContextValue | null>(null)

// ─── Posición ──────────────────────────────────────────────────────────────────

function computePos(rect: DOMRect, placement: PopoverPlacement, panelW: number, panelH: number) {
    const gap = 8
    switch (placement) {
        case "top":
            return { top: rect.top - panelH - gap + window.scrollY, left: rect.left + rect.width / 2 - panelW / 2 + window.scrollX }
        case "bottom":
            return { top: rect.bottom + gap + window.scrollY, left: rect.left + rect.width / 2 - panelW / 2 + window.scrollX }
        case "left":
            return { top: rect.top + rect.height / 2 - panelH / 2 + window.scrollY, left: rect.left - panelW - gap + window.scrollX }
        case "right":
            return { top: rect.top + rect.height / 2 - panelH / 2 + window.scrollY, left: rect.right + gap + window.scrollX }
    }
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function Popover({ placement = "bottom", width = "280px", children }: PopoverProps) {
    const id = useId()
    const [open, setOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const panelRef = useRef<HTMLDivElement>(null)

    const toggle = useCallback(
        (triggerEl: HTMLElement) => {
            setOpen((prev) => {
                if (!prev) {
                    requestAnimationFrame(() => {
                        const rect = triggerEl.getBoundingClientRect()
                        const w = panelRef.current?.offsetWidth ?? parseInt(width)
                        const h = panelRef.current?.offsetHeight ?? 100
                        setCoords(computePos(rect, placement, w, h))
                    })
                }
                return !prev
            })
        },
        [placement, width]
    )

    const close = useCallback(() => setOpen(false), [])

    useEffect(() => {
        if (!open) return
        function handler(e: globalThis.MouseEvent) {
            const path = e.composedPath()
            const hitPanel = panelRef.current && path.includes(panelRef.current)
            if (!hitPanel) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    useEffect(() => {
        if (!open) return
        function handler(e: globalThis.KeyboardEvent) {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [open])

    return (
        <PopoverContext.Provider value={{ id, open, toggle, close }}>
            {children}
            {createPortal(
                <div
                    ref={panelRef}
                    id={id}
                    role="dialog"
                    aria-modal="false"
                    style={{
                        position: "absolute",
                        top: coords.top,
                        left: coords.left,
                        width,
                        zIndex: 50,
                        display: open ? "block" : "none",
                    }}
                    className="rounded-lg border border-border bg-surface shadow-lift"
                >
                    {/* PopoverContent se renderiza aquí vía contexto */}
                </div>,
                document.body
            )}
        </PopoverContext.Provider>
    )
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

export const PopoverTrigger = forwardRef<HTMLSpanElement, PopoverTriggerProps>(
    ({ children, ...rest }, externalRef) => {
        const ctx = useContext(PopoverContext)
        if (!ctx) throw new Error("PopoverTrigger must be inside <Popover>")

        const localRef = useRef<HTMLSpanElement>(null)

        const mergedRef = useCallback(
            (node: HTMLSpanElement | null) => {
                ;(localRef as React.MutableRefObject<HTMLSpanElement | null>).current = node
                if (typeof externalRef === "function") externalRef(node)
                else if (externalRef) (externalRef as React.MutableRefObject<HTMLSpanElement | null>).current = node
            },
            [externalRef]
        )

        const handleToggle = useCallback(() => {
            if (localRef.current) ctx.toggle(localRef.current)
        }, [ctx])

        return (
            <span
                ref={mergedRef}
                onClick={handleToggle}
                aria-expanded={ctx.open}
                aria-haspopup="dialog"
                aria-controls={ctx.id}
                style={{ display: "contents" }}
                {...rest}
            >
                {children}
            </span>
        )
    }
)
PopoverTrigger.displayName = "PopoverTrigger"

// ─── Content ─────────────────────────────────────────────────────────────────

export function PopoverContent({ children, className }: PopoverContentProps) {
    const ctx = useContext(PopoverContext)
    if (!ctx) throw new Error("PopoverContent must be inside <Popover>")
    if (!ctx.open) return null

    const panelEl = document.getElementById(ctx.id)
    if (!panelEl) return null

    return createPortal(<div className={cn("p-3", className)}>{children}</div>, panelEl)
}

export type { PopoverProps, PopoverTriggerProps, PopoverContentProps, PopoverPlacement }