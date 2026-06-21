import type { HTMLAttributes } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
    /** Página actual (1-indexed) */
    page: number
    /** Total de páginas */
    totalPages: number
    onPageChange: (page: number) => void
    /** Botones de página a cada lado de la actual */
    siblingCount?: number
    /** Selector de tamaño de página opcional */
    pageSize?: number
    pageSizeOptions?: number[]
    onPageSizeChange?: (size: number) => void
    /** Muestra "X de Y" */
    showInfo?: boolean
    totalItems?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function getPages(current: number, total: number, siblings: number): (number | "...")[] {
    const totalButtons = siblings * 2 + 5

    if (total <= totalButtons) return range(1, total)

    const leftSibling = Math.max(current - siblings, 1)
    const rightSibling = Math.min(current + siblings, total)

    const showLeft = leftSibling > 2
    const showRight = rightSibling < total - 1

    if (!showLeft && showRight) return [...range(1, 3 + siblings * 2), "...", total]
    if (showLeft && !showRight) return [1, "...", ...range(total - (3 + siblings * 2) + 1, total)]
    return [1, "...", ...range(leftSibling, rightSibling), "...", total]
}

// ─── Botón de página ─────────────────────────────────────────────────────────

function PageButton({
                        page,
                        active,
                        disabled,
                        onClick,
                    }: {
    page: number | "..."
    active?: boolean
    disabled?: boolean
    onClick?: () => void
}) {
    if (page === "...") {
        return <span className="flex h-8 w-8 items-center justify-center text-sm text-text-muted">…</span>
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-primary text-white" : "text-text-muted hover:bg-surface-muted",
                disabled && "cursor-not-allowed opacity-40",
            )}
        >
            {page}
        </button>
    )
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Pagination({
                               page,
                               totalPages,
                               onPageChange,
                               siblingCount = 1,
                               pageSize,
                               pageSizeOptions = [10, 25, 50, 100],
                               onPageSizeChange,
                               showInfo = false,
                               totalItems,
                               className,
                               ...rest
                           }: PaginationProps) {
    const pages = getPages(page, totalPages, siblingCount)

    const start = totalItems ? (page - 1) * (pageSize ?? 10) + 1 : undefined
    const end = totalItems ? Math.min(page * (pageSize ?? 10), totalItems) : undefined

    return (
        <div className={cn("flex flex-wrap items-center justify-between gap-4", className)} {...rest}>
            {showInfo && totalItems !== undefined && (
                <p className="text-sm text-text-muted">
                    Mostrando <span className="font-medium text-text">{start}</span>–
                    <span className="font-medium text-text">{end}</span> de{" "}
                    <span className="font-medium text-text">{totalItems}</span>
                </p>
            )}

            <nav aria-label="Paginación" className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Página anterior"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                </button>

                {pages.map((p, i) => (
                    <PageButton
                        key={p === "..." ? `dots-${i}` : p}
                        page={p}
                        active={p === page}
                        disabled={p === "..."}
                        onClick={p !== "..." ? () => onPageChange(p) : undefined}
                    />
                ))}

                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Página siguiente"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </button>
            </nav>

            {pageSize !== undefined && onPageSizeChange && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>Filas:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {pageSizeOptions.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}

export type { PaginationProps }