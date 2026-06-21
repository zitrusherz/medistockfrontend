import { forwardRef, type HTMLAttributes, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface BreadcrumbItem {
    label: string
    href?: string
    onClick?: () => void
}

interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    title: ReactNode
    description?: ReactNode
    /** Breadcrumb trail rendered above title */
    breadcrumb?: BreadcrumbItem[]
    /** Right-aligned slot: buttons, badges, etc */
    actions?: ReactNode
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1
                    return (
                        <li key={i} className="flex items-center gap-1">
                            {i > 0 && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                            {isLast ? (
                                <span className="font-medium text-slate-600" aria-current="page">
                  {item.label}
                </span>
                            ) : item.href ? (
                                <a
                                    href={item.href}
                                    className="hover:text-slate-600 transition-colors"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className="hover:text-slate-600 transition-colors"
                                >
                                    {item.label}
                                </button>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
    (
        {
            title,
            description,
            breadcrumb,
            actions,
            className = "",
            ...rest
        },
        ref
    ) => {
        return (
            <header
                ref={ref as React.Ref<HTMLElement>}
                className={[
                    "flex flex-col gap-3 pb-6 border-b border-slate-200",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
                {...rest}
            >
                {breadcrumb && breadcrumb.length > 0 && (
                    <Breadcrumb items={breadcrumb} />
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-slate-900 leading-tight tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-slate-500">{description}</p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex shrink-0 items-center gap-2">{actions}</div>
                    )}
                </div>
            </header>
        )
    }
)

PageHeader.displayName = "PageHeader"

export type { PageHeaderProps, BreadcrumbItem }