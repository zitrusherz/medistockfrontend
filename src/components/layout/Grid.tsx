import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12
type GridGap = 0 | 2 | 3 | 4 | 6 | 8 | 10 | 12
type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 12 | "full"

interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Base columns (mobile-first) */
  cols?: GridCols
  /** Tablet breakpoint columns */
  colsMd?: GridCols
  /** Desktop breakpoint columns */
  colsLg?: GridCols
  gap?: GridGap
  children?: ReactNode
}

interface GridItemProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  span?: GridColSpan
  spanMd?: GridColSpan
  spanLg?: GridColSpan
  children?: ReactNode
}

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const colsMap: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
}

const mdColsMap: Record<GridCols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
}

const lgColsMap: Record<GridCols, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
}

const gapMap: Record<GridGap, string> = {
  0: "gap-0",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
}

const spanMap: Record<GridColSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  12: "col-span-12",
  full: "col-span-full",
}

const mdSpanMap: Record<GridColSpan, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  12: "md:col-span-12",
  full: "md:col-span-full",
}

const lgSpanMap: Record<GridColSpan, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  12: "lg:col-span-12",
  full: "lg:col-span-full",
}

// ─── Grid ────────────────────────────────────────────────────────────────────

export const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      as: Tag = "div",
      cols = 1,
      colsMd,
      colsLg,
      gap = 4,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      "grid",
      colsMap[cols],
      colsMd ? mdColsMap[colsMd] : "",
      colsLg ? lgColsMap[colsLg] : "",
      gapMap[gap],
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

Grid.displayName = "Grid"

// ─── GridItem ────────────────────────────────────────────────────────────────

export const GridItem = forwardRef<HTMLElement, GridItemProps>(
  (
    {
      as: Tag = "div",
      span,
      spanMd,
      spanLg,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      span ? spanMap[span] : "",
      spanMd ? mdSpanMap[spanMd] : "",
      spanLg ? lgSpanMap[spanLg] : "",
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

GridItem.displayName = "GridItem"

export type { GridProps, GridItemProps, GridCols, GridGap, GridColSpan }
