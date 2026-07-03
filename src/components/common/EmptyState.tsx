

import type { ReactNode } from "react"

interface EmptyStateProps {
    title: string
    description?: ReactNode
    /** Ícono opcional (ej. <PackageIcon size={28} />). */
    icon?: ReactNode
    /** Acción opcional, normalmente un <Button as={Link} to="…">. */
    action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
            {icon && <div className="text-text-muted">{icon}</div>}
            <p className="font-display text-lg font-semibold text-text">{title}</p>
            {description && (
                <p className="max-w-sm text-sm text-text-muted">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}

export type { EmptyStateProps }
