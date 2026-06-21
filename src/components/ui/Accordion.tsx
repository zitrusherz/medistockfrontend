import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useId,
    useState,
    type HTMLAttributes,
    type ReactNode,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AccordionContextValue {
    openItems: Set<string>
    toggle: (id: string) => void
}

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    /** Permite varios ítems abiertos a la vez */
    multiple?: boolean
    /** IDs abiertos inicialmente */
    defaultOpen?: string[]
    children: ReactNode
}

interface AccordionItemProps {
    id?: string
    value?: string
    title: ReactNode
    subtitle?: ReactNode
    children: ReactNode
    /** Deshabilita este ítem */
    disabled?: boolean
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const AccordionContext = createContext<AccordionContextValue | null>(null)

// ─── Accordion ───────────────────────────────────────────────────────────────

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
    ({ multiple = false, defaultOpen = [], children, className, ...rest }, ref) => {
        const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen))

        const toggle = useCallback(
            (id: string) => {
                setOpenItems((prev) => {
                    const next = new Set(prev)
                    if (next.has(id)) {
                        next.delete(id)
                    } else {
                        if (!multiple) next.clear()
                        next.add(id)
                    }
                    return next
                })
            },
            [multiple]
        )

        return (
            <AccordionContext.Provider value={{ openItems, toggle }}>
                <div
                    ref={ref}
                    className={cn(
                        "divide-y divide-border overflow-hidden rounded-lg border border-border",
                        className,
                    )}
                    {...rest}
                >
                    {children}
                </div>
            </AccordionContext.Provider>
        )
    }
)
Accordion.displayName = "Accordion"

// ─── AccordionItem ───────────────────────────────────────────────────────────

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ id: propId, value, title, subtitle, children, disabled = false }, ref) => {
        const ctx = useContext(AccordionContext)
        const generatedId = useId()
        const id = propId ?? value ?? generatedId
        const panelId = `panel-${id}`
        const triggerId = `trigger-${id}`

        const isOpen = ctx?.openItems.has(id) ?? false

        function handleClick() {
            if (!disabled && ctx) ctx.toggle(id)
        }

        function handleKeyDown(e: React.KeyboardEvent) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleClick()
            }
        }

        return (
            <div ref={ref} className={disabled ? "opacity-50" : ""}>
                {/* Trigger */}
                <button
                    id={triggerId}
                    type="button"
                    aria-controls={panelId}
                    aria-expanded={isOpen}
                    disabled={disabled}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "flex w-full items-center justify-between gap-4 bg-surface px-5 py-4 text-left text-sm font-medium text-text transition-colors duration-150",
                        !disabled
                            ? "hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            : "cursor-not-allowed",
                    )}
                >
                    <div className="flex-1">
                        <span className="block">{title}</span>
                        {subtitle && <span className="text-xs text-text-muted font-normal">{subtitle}</span>}
                    </div>

                    {/* Chevron */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className={cn(
                            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
                            isOpen && "rotate-180",
                        )}
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {/* Panel */}
                <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    hidden={!isOpen}
                    className="overflow-hidden bg-surface"
                >
                    <div className="px-5 pt-1 pb-4 text-sm text-text-muted">{children}</div>
                </div>
            </div>
        )
    }
)
AccordionItem.displayName = "AccordionItem"

export type { AccordionProps, AccordionItemProps }