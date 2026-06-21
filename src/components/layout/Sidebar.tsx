import {
  forwardRef,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { SidebarContext } from "./SidebarContext"
import type { SidebarContextValue } from "./SidebarContext"

// ─── Types ───────────────────────────────────────────────────────────────────

// Re-export so consumers can import from either file
export type { SidebarContextValue }

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Controlled collapsed state */
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Sidebar width when expanded */
  width?: string
  /** Width when collapsed (icon-only mode) */
  collapsedWidth?: string
  children?: ReactNode
}

interface SidebarNavItemProps extends HTMLAttributes<HTMLElement> {
  icon?: ReactNode
  label: string
  active?: boolean
  /** Show item even in collapsed mode (icon only) */
  href?: string
  onClick?: () => void
  badge?: ReactNode
}

interface SidebarSectionProps {
  label?: string
  children: ReactNode
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      collapsed: controlledCollapsed,
      onCollapsedChange,
      width = "w-60",
      collapsedWidth = "w-16",
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = useState(false)
    const isControlled = controlledCollapsed !== undefined
    const collapsed = isControlled ? controlledCollapsed : internalCollapsed

    function toggle() {
      const next = !collapsed
      if (!isControlled) setInternalCollapsed(next)
      onCollapsedChange?.(next)
    }

    return (
      <SidebarContext.Provider value={{ collapsed, toggle }}>
        <aside
          ref={ref as React.Ref<HTMLElement>}
          className={[
            "fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col border-r border-slate-200 bg-white transition-all duration-300 overflow-hidden",
            collapsed ? collapsedWidth : width,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Navegación lateral"
          {...rest}
        >
          {children}

          {/* Collapse toggle at bottom */}
          <div className="mt-auto border-t border-slate-200 p-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={[
                  "h-4 w-4 shrink-0 transition-transform duration-300",
                  collapsed ? "rotate-180" : "",
                ].join(" ")}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
              {!collapsed && <span>Colapsar</span>}
            </button>
          </div>
        </aside>
      </SidebarContext.Provider>
    )
  }
)

Sidebar.displayName = "Sidebar"

// ─── SidebarSection ───────────────────────────────────────────────────────────

export function SidebarSection({ label, children }: SidebarSectionProps) {
  const { collapsed } = useContext(SidebarContext)

  return (
    <div className="px-2 py-3">
      {label && !collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </p>
      )}
      <ul className="flex flex-col gap-0.5" role="list">
        {children}
      </ul>
    </div>
  )
}

// ─── SidebarNavItem ───────────────────────────────────────────────────────────

export function SidebarNavItem({
  icon,
  label,
  active = false,
  href,
  onClick,
  badge,
  className = "",
  ...rest
}: SidebarNavItemProps) {
  const { collapsed } = useContext(SidebarContext)

  const base = [
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
    active
      ? "bg-sky-50 text-sky-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
    collapsed ? "justify-center" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const content = (
    <>
      {icon && (
        <span className="shrink-0 h-5 w-5 flex items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {!collapsed && (
        <span className="flex-1 truncate">{label}</span>
      )}
      {!collapsed && badge && (
        <span className="shrink-0">{badge}</span>
      )}
    </>
  )

  const el = href ? (
    <a
      href={href}
      className={base}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      {...(rest as HTMLAttributes<HTMLAnchorElement>)}
    >
      {content}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={base}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      {...(rest as HTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  )

  return <li>{el}</li>
}

export type { SidebarProps, SidebarNavItemProps, SidebarSectionProps }
