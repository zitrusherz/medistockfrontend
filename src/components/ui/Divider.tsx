import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DividerOrientation = "horizontal" | "vertical"
type DividerVariant = "solid" | "dashed" | "dotted"
type DividerLabelAlign = "left" | "center" | "right"

interface DividerProps extends HTMLAttributes<HTMLElement> {
    orientation?: DividerOrientation
    variant?: DividerVariant
    /** Texto o elemento sobre la línea */
    label?: ReactNode
    labelAlign?: DividerLabelAlign
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const lineStyles: Record<DividerVariant, string> = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
}

const labelAlignStyles: Record<DividerLabelAlign, string> = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
}



export const Divider = forwardRef<HTMLElement, DividerProps>(
    ({ orientation = "horizontal", variant = "solid", label, labelAlign = "center", className, ...rest }, ref) => {
        if (orientation === "vertical") {
            return (
                <div
                    ref={ref as Ref<HTMLDivElement>}
                    role="separator"
                    aria-orientation="vertical"
                    className={cn(
                        "inline-block h-full min-h-[1em] w-px self-stretch border-l border-border",
                        lineStyles[variant],
                        className,
                    )}
                    {...rest}
                />
            )
        }

        if (label) {
            return (
                <div
                    ref={ref as Ref<HTMLDivElement>}
                    role="separator"
                    aria-orientation="horizontal"
                    className={cn("flex w-full items-center gap-3", labelAlignStyles[labelAlign], className)}
                    {...rest}
                >
                    {labelAlign !== "left" && (
                        <span className={cn("flex-1 border-t border-border", lineStyles[variant])} />
                    )}
                    <span className="shrink-0 text-xs font-medium text-text-muted">{label}</span>
                    {labelAlign !== "right" && (
                        <span className={cn("flex-1 border-t border-border", lineStyles[variant])} />
                    )}
                </div>
            )
        }

        return (
            <hr
                ref={ref as Ref<HTMLHRElement>}
                role="separator"
                className={cn("w-full border-0 border-t border-border", lineStyles[variant], className)}
                {...rest}
            />
        )
    }
)
Divider.displayName = "Divider"

export type { DividerProps, DividerOrientation, DividerVariant }