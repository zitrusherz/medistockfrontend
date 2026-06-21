import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type StackDirection = "row" | "col" | "row-reverse" | "col-reverse"
type StackAlign = "start" | "center" | "end" | "stretch" | "baseline"
type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly"
type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

interface StackProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType
    direction?: StackDirection
    align?: StackAlign
    justify?: StackJustify
    gap?: StackGap
    wrap?: boolean
    children?: ReactNode
}

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const directionMap: Record<StackDirection, string> = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse",
}

const alignMap: Record<StackAlign, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
}

const justifyMap: Record<StackJustify, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
}

const gapMap: Record<StackGap, string> = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
    16: "gap-16",
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Stack = forwardRef<HTMLElement, StackProps>(
    (
        {
            as: Tag = "div",
            direction = "col",
            align = "stretch",
            justify = "start",
            gap = 4,
            wrap = false,
            className = "",
            children,
            ...rest
        },
        ref
    ) => {
        const classes = [
            "flex",
            directionMap[direction],
            alignMap[align],
            justifyMap[justify],
            gapMap[gap],
            wrap ? "flex-wrap" : "flex-nowrap",
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

Stack.displayName = "Stack"

export type { StackProps, StackDirection, StackAlign, StackJustify, StackGap }