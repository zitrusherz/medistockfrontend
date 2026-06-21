import { forwardRef, type HTMLAttributes, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Logo / brand element */
  brand?: ReactNode
  /** Center slot: search, tabs, etc */
  center?: ReactNode
  /** Right slot: avatar, notifications, actions */
  end?: ReactNode
  /** Height class override */
  height?: string
  /** Show bottom border (default true) */
  bordered?: boolean
  /** Background class override */
  bg?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      brand,
      center,
      end,
      height = "h-14",
      bordered = true,
      bg = "bg-white",
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <header
        ref={ref as React.Ref<HTMLElement>}
        className={[
          "fixed top-0 inset-x-0 z-40 flex items-center px-4 sm:px-6",
          height,
          bg,
          bordered ? "border-b border-slate-200" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-center">
          {brand}
        </div>

        {/* Center */}
        {center && (
          <div className="flex flex-1 items-center justify-center px-4">
            {center}
          </div>
        )}

        {/* Spacer when no center */}
        {!center && <div className="flex-1" />}

        {/* End slot */}
        {end && (
          <div className="flex shrink-0 items-center gap-2">
            {end}
          </div>
        )}

        {/* Raw children (escape hatch) */}
        {children}
      </header>
    )
  }
)

Navbar.displayName = "Navbar"

export type { NavbarProps }
