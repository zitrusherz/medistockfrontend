import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    as?: ElementType
    title?: ReactNode
    description?: ReactNode
    /** Right-aligned content in the header row (actions, button) */
    action?: ReactNode
    children?: ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Section = forwardRef<HTMLElement, SectionProps>(
    (
        {
            as: Tag = "section",
            title,
            description,
            action,
            className = "",
            children,
            ...rest
        },
        ref
    ) => {
        const hasHeader = title ?? description ?? action

        return (
            <Tag
                ref={ref}
                className={["space-y-4", className].filter(Boolean).join(" ")}
                {...rest}
            >
                {hasHeader && (
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            {title && (
                                <h2 className="text-base font-semibold text-slate-800 leading-snug">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
                            )}
                        </div>
                        {action && <div className="shrink-0">{action}</div>}
                    </div>
                )}
                {children}
            </Tag>
        )
    }
)

Section.displayName = "Section"

export type { SectionProps }