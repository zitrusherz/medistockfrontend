import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useId,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TooltipPlacement = "top" | "bottom" | "left" | "right"

interface TooltipContextValue {
    id: string
    visible: boolean
    show: (triggerEl: HTMLElement) => void
    hide: () => void
}

interface TooltipProps {
    content: ReactNode
    placement?: TooltipPlacement
    delay?: number
    disabled?: boolean
    children: ReactNode
}

interface TooltipTriggerProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const TooltipContext = createContext<TooltipContextValue | null>(null)

// ─── Posición ──────────────────────────────────────────────────────────────────

function getPosition(rect: DOMRect, placement: TooltipPlacement, tipW: number, tipH: number) {
    const gap = 8
    switch (placement) {
        case "top":
            return { top: rect.top - tipH - gap + window.scrollY, left: rect.left + rect.width / 2 - tipW / 2 + window.scrollX }
        case "bottom":
            return { top: rect.bottom + gap + window.scrollY, left: rect.left + rect.width / 2 - tipW / 2 + window.scrollX }
        case "left":
            return { top: rect.top + rect.height / 2 - tipH / 2 + window.scrollY, left: rect.left - tipW - gap + window.scrollX }
        case "right":
            return { top: rect.top + rect.height / 2 - tipH / 2 + window.scrollY, left: rect.right + gap + window.scrollX }
    }
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function Tooltip({ content, placement = "top", delay = 200, disabled = false, children }: TooltipProps) {
    const id = useId()
    const [visible, setVisible] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const tipRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const show = useCallback(
        (triggerEl: HTMLElement) => {
            if (disabled) return
            timerRef.current = setTimeout(() => {
                const rect = triggerEl.getBoundingClientRect()
                const w = tipRef.current?.offsetWidth ?? 160
                const h = tipRef.current?.offsetHeight ?? 32
                setCoords(getPosition(rect, placement, w, h))
                setVisible(true)
            }, delay)
        },
        [disabled, delay, placement]
    )

    const hide = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setVisible(false)
    }, [])

    return (
        <TooltipContext.Provider value={{ id, visible, show, hide }}>
            {children}
            {createPortal(
                <div
                    ref={tipRef}
                    id={id}
                    role="tooltip"
                    style={{ position: "absolute", top: coords.top, left: coords.left, pointerEvents: "none" }}
                    className={cn(
                        "z-50 max-w-xs rounded-md bg-ink px-2.5 py-1.5 text-xs text-white shadow-lift transition-opacity duration-150",
                        visible ? "opacity-100" : "opacity-0",
                    )}
                >
                    {content}
                </div>,
                document.body
            )}
        </TooltipContext.Provider>
    )
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

export const TooltipTrigger = forwardRef<HTMLSpanElement, TooltipTriggerProps>(
    ({ children, ...rest }, externalRef) => {
        const ctx = useContext(TooltipContext)
        if (!ctx) throw new Error("TooltipTrigger must be inside <Tooltip>")

        const localRef = useRef<HTMLSpanElement>(null)

        const mergedRef = useCallback(
            (node: HTMLSpanElement | null) => {
                ;(localRef as React.MutableRefObject<HTMLSpanElement | null>).current = node
                if (typeof externalRef === "function") externalRef(node)
                else if (externalRef) (externalRef as React.MutableRefObject<HTMLSpanElement | null>).current = node
            },
            [externalRef]
        )

        const handleShow = useCallback(() => {
            if (localRef.current) ctx.show(localRef.current)
        }, [ctx])

        return (
            <span
                ref={mergedRef}
                onMouseEnter={handleShow}
                onMouseLeave={ctx.hide}
                onFocus={handleShow}
                onBlur={ctx.hide}
                aria-describedby={ctx.visible ? ctx.id : undefined}
                style={{ display: "contents" }}
                {...rest}
            >
                {children}
            </span>
        )
    }
)
TooltipTrigger.displayName = "TooltipTrigger"

export type { TooltipProps, TooltipTriggerProps, TooltipPlacement }