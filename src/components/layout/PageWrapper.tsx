import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type PageWrapperSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full"

interface PageWrapperProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Max-width preset */
  size?: PageWrapperSize
  /** Horizontal padding preset */
  padX?: boolean
  /** Vertical padding preset */
  padY?: boolean
  children?: ReactNode
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const sizeMap: Record<PageWrapperSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-none",
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PageWrapper = forwardRef<HTMLElement, PageWrapperProps>(
  (
    {
      as: Tag = "main",
      size = "xl",
      padX = true,
      padY = true,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      "w-full mx-auto",
      sizeMap[size],
      padX ? "px-4 sm:px-6 lg:px-8" : "",
      padY ? "py-6 lg:py-8" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <Tag ref={ref} className={classes} {...rest}>
        {children}
      </Tag>
    )
  }
)

PageWrapper.displayName = "PageWrapper"

export type { PageWrapperProps, PageWrapperSize }
