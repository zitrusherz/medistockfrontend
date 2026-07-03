

import {
    createContext,
    useContext,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
    type TdHTMLAttributes,
    type ThHTMLAttributes,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SortState {
    column: string | null
    direction: "asc" | "desc"
}

interface TableContextValue {
    sort: SortState
    onSort: (column: string) => void
    sortable: boolean
    stickyHeader: boolean
}

interface TableProps extends HTMLAttributes<HTMLTableElement> {
    /** Filas con color alterno */
    striped?: boolean
    /** Bordes de celda visibles */
    bordered?: boolean
    /** thead fijo al hacer scroll */
    stickyHeader?: boolean
    /** Filas skeleton de carga */
    loading?: boolean
    loadingRows?: number
    /** Columnas ordenables (habilitá por columna con sortKey) */
    sortable?: boolean
    onSortChange?: (state: SortState) => void
    /**
     * M14 — ancho mínimo del <table> (valor CSS, ej. "40rem" / "640px").
     * Cuando se setea, el contenedor (overflow-x-auto) scrollea en pantallas
     * angostas en vez de aplastar las columnas. Sin valor: comportamiento previo.
     */
    minWidth?: string
    children: ReactNode
}

interface ColumnProps extends ThHTMLAttributes<HTMLTableCellElement> {
    /** Clave de columna para ordenar */
    sortKey?: string
    children: ReactNode
}

interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
    children: ReactNode
    selected?: boolean
    onClick?: () => void
}

interface CellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    children?: ReactNode
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const TableContext = createContext<TableContextValue | null>(null)

// ─── Ícono de orden ─────────────────────────────────────────────────────────

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
    return (
        <span className="ml-1.5 inline-flex flex-col gap-0 leading-none">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn("h-3 w-3 transition-opacity", active && direction === "asc" ? "text-primary opacity-100" : "opacity-30")}
                aria-hidden="true"
            >
                <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
            </svg>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn("h-3 w-3 transition-opacity", active && direction === "desc" ? "text-primary opacity-100" : "opacity-30")}
                aria-hidden="true"
            >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
        </span>
    )
}

// ─── Table ───────────────────────────────────────────────────────────────────

export function Table({
                          striped = false,
                          bordered = false,
                          stickyHeader = false,
                          loading = false,
                          loadingRows = 5,
                          sortable: isSortable = false,
                          onSortChange,
                          minWidth,
                          className,
                          style,
                          children,
                          ...rest
                      }: TableProps) {
    const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" })

    function handleSort(column: string) {
        const next: SortState = {
            column,
            direction: sort.column === column && sort.direction === "asc" ? "desc" : "asc",
        }
        setSort(next)
        onSortChange?.(next)
    }


    const tableStyle: CSSProperties | undefined = minWidth
        ? { minWidth, ...style }
        : style

    return (
        <TableContext.Provider value={{ sort, onSort: handleSort, sortable: isSortable, stickyHeader }}>
            {/* max-h-[32rem]: antes `max-h-128`, que no existe en la escala de Tailwind. */}
            <div className={cn("w-full overflow-x-auto rounded-lg border border-border", stickyHeader && "max-h-[32rem] overflow-y-auto")}>
                <table
                    className={cn(
                        "w-full border-collapse text-sm",
                        striped && "[&_tbody_tr:nth-child(even)]:bg-surface-muted",
                        bordered && "[&_td]:border-x [&_th]:border-x [&_td]:border-border [&_th]:border-border",
                        className,
                    )}
                    style={tableStyle}
                    {...rest}
                >
                    {children}
                </table>

                {loading && (
                    <div className="divide-y divide-border" style={minWidth ? { minWidth } : undefined}>
                        {Array.from({ length: loadingRows }).map((_, i) => (
                            <div key={i} className="flex gap-4 px-4 py-3">
                                <div className="h-4 flex-1 animate-pulse rounded bg-surface-muted" />
                                <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
                                <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TableContext.Provider>
    )
}

// ─── Thead ───────────────────────────────────────────────────────────────────

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
    const ctx = useContext(TableContext)

    return (
        <thead
            className={cn(
                "bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted",
                ctx?.stickyHeader && "sticky top-0 z-10 shadow-sm",
                className,
            )}
        >
        {children}
        </thead>
    )
}

// ─── Tbody ───────────────────────────────────────────────────────────────────

export function TableBody({
                              children,
                              emptyText = "No hay datos disponibles",
                              isEmpty = false,
                          }: {
    children: ReactNode
    emptyText?: string
    isEmpty?: boolean
}) {
    if (isEmpty) {
        return (
            <tbody>
            <tr>
                <td colSpan={999} className="px-6 py-12 text-center text-sm text-text-muted">
                    {emptyText}
                </td>
            </tr>
            </tbody>
        )
    }
    return <tbody className="divide-y divide-border bg-surface">{children}</tbody>
}

// ─── Column (TH ordenable) ────────────────────────────────────────────────────

export function TableColumn({ sortKey, children, className, ...rest }: ColumnProps) {
    const ctx = useContext(TableContext)
    const canSort = ctx?.sortable && Boolean(sortKey)
    const isActive = ctx?.sort.column === sortKey

    return (
        <th
            scope="col"
            aria-sort={isActive ? (ctx?.sort.direction === "asc" ? "ascending" : "descending") : undefined}
            className={cn(
                "whitespace-nowrap px-4 py-3 text-left",
                canSort && "cursor-pointer select-none transition-colors hover:bg-surface-muted",
                className,
            )}
            onClick={() => canSort && sortKey && ctx?.onSort(sortKey)}
            {...rest}
        >
            <span className="inline-flex items-center">
                {children}
                {canSort && <SortIcon active={isActive ?? false} direction={ctx?.sort.direction ?? "asc"} />}
            </span>
        </th>
    )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

export function TableRow({ children, selected = false, onClick, className, ...rest }: RowProps) {
    return (
        <tr
            className={cn(
                "transition-colors duration-100",
                selected && "bg-primary/5",
                onClick && "cursor-pointer hover:bg-surface-muted",
                className,
            )}
            onClick={onClick}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick() } : undefined}
            {...rest}
        >
            {children}
        </tr>
    )
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

export function TableCell({ children, className, ...rest }: CellProps) {
    return (
        <td className={cn("px-4 py-3 text-text", className)} {...rest}>
            {children}
        </td>
    )
}

export type { TableProps, ColumnProps, RowProps, CellProps, SortState }
