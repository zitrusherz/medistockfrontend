import {
    createContext,
    useContext,
    useId,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TabsVariant = "underline" | "pills" | "bordered"

interface TabsContextValue {
    activeTab: string
    setActive: (id: string) => void
    variant: TabsVariant
    baseId: string
}

interface TabsProps {
    defaultTab?: string
    activeTab?: string
    onTabChange?: (id: string) => void
    variant?: TabsVariant
    children: ReactNode
    className?: string
}

interface TabListProps {
    children: ReactNode
    className?: string
}

interface TabProps {
    id: string
    children: ReactNode
    disabled?: boolean
    /** Ícono antes de la etiqueta */
    icon?: ReactNode
    /** Badge/contador después de la etiqueta */
    badge?: ReactNode
}

interface TabPanelProps {
    id: string
    children: ReactNode
    className?: string
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const TabsContext = createContext<TabsContextValue | null>(null)

// ─── Estilos por variante ───────────────────────────────────────────────────

const listVariantStyles: Record<TabsVariant, string> = {
    underline: "border-b border-border gap-0",
    pills: "gap-1 bg-surface-muted rounded-lg p-1",
    bordered: "border border-border rounded-lg overflow-hidden divide-x divide-border gap-0",
}

function getTabStyles(variant: TabsVariant, active: boolean, disabled: boolean) {
    const base =
        "inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"

    if (disabled) return cn(base, "opacity-40 cursor-not-allowed")

    if (variant === "underline") {
        return cn(
            base,
            "px-4 py-2.5 -mb-px border-b-2",
            active
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text hover:border-border",
        )
    }

    if (variant === "pills") {
        return cn(
            base,
            "px-4 py-1.5 rounded-md",
            active ? "bg-surface text-text shadow-card" : "text-text-muted hover:text-text",
        )
    }

    // bordered
    return cn(
        base,
        "px-4 py-2.5 bg-surface",
        active ? "bg-primary/5 text-primary" : "text-text-muted hover:bg-surface-muted",
    )
}

// ─── Tabs (root) ──────────────────────────────────────────────────────────────

export function Tabs({
                         defaultTab,
                         activeTab: controlledTab,
                         onTabChange,
                         variant = "underline",
                         children,
                         className,
                     }: TabsProps) {
    const baseId = useId()
    const [internalTab, setInternalTab] = useState(defaultTab ?? "")

    const isControlled = controlledTab !== undefined
    const activeTab = isControlled ? controlledTab : internalTab

    function setActive(id: string) {
        if (!isControlled) setInternalTab(id)
        onTabChange?.(id)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActive, variant, baseId }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

// ─── TabList ─────────────────────────────────────────────────────────────────

export function TabList({ children, className }: TabListProps) {
    const ctx = useContext(TabsContext)
    if (!ctx) throw new Error("TabList must be inside Tabs")

    return (
        <div role="tablist" className={cn("flex", listVariantStyles[ctx.variant], className)}>
            {children}
        </div>
    )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export function Tab({ id, children, disabled = false, icon, badge }: TabProps) {
    const ctx = useContext(TabsContext)
    if (!ctx) throw new Error("Tab must be inside Tabs")

    const isActive = ctx.activeTab === id
    const panelId = `${ctx.baseId}-panel-${id}`
    const tabId = `${ctx.baseId}-tab-${id}`

    function handleKey(e: KeyboardEvent<HTMLButtonElement>) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (!disabled && ctx) ctx.setActive(id)
        }
    }

    return (
        <button
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            aria-disabled={disabled}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => !disabled && ctx.setActive(id)}
            onKeyDown={handleKey}
            className={getTabStyles(ctx.variant, isActive, disabled)}
        >
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
            {badge && <span>{badge}</span>}
        </button>
    )
}

// ─── TabPanel ────────────────────────────────────────────────────────────────

export function TabPanel({ id, children, className }: TabPanelProps) {
    const ctx = useContext(TabsContext)
    if (!ctx) throw new Error("TabPanel must be inside Tabs")

    const panelId = `${ctx.baseId}-panel-${id}`
    const tabId = `${ctx.baseId}-tab-${id}`
    const isActive = ctx.activeTab === id

    if (!isActive) return null

    return (
        <div id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0} className={cn("py-4 focus:outline-none", className)}>
            {children}
        </div>
    )
}

export type { TabsProps, TabListProps, TabProps, TabPanelProps, TabsVariant }