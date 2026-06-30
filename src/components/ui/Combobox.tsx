// src/components/ui/Combobox.tsx
import {
    forwardRef,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ComboboxOption {
    value: string
    label: string
    disabled?: boolean
}

interface ComboboxProps {
    label?: string
    error?: string
    hint?: string
    required?: boolean
    /** Opciones a mostrar/filtrar. */
    options: ComboboxOption[]
    /** Valor seleccionado (controlado). Cadena vacía = sin selección. */
    value: string
    /** Devuelve el `value` de la opción elegida. */
    onChange: (value: string) => void
    /** Texto del campo cuando no hay selección. */
    placeholder?: string
    /** Texto cuando el filtro no deja resultados. */
    emptyMessage?: string
    /** Ícono/elemento a la izquierda dentro del campo. */
    leftAddon?: ReactNode
    disabled?: boolean
    fullWidth?: boolean
    /** Para el atributo name del input (autocomplete, etc). */
    name?: string
    id?: string
}

// ─── Normalización para el filtro (sin tildes, sin mayúsculas) ───────────────

/** "Ñuñoa" / "Biobío" → "nunoa" / "biobio". Quita diacríticos y baja a minúscula. */
function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
}

/** Escapa metacaracteres para construir un RegExp seguro desde lo que escribe el usuario. */
function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// ─── Estilos (espejo de Input/Select del kit) ───────────────────────────────

const baseField =
    "block w-full rounded-md border bg-surface text-sm text-text placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed py-2 pr-9"

const stateNormal = "border-border focus-visible:ring-ring focus-visible:border-primary"
const stateError = "border-danger focus-visible:ring-danger focus-visible:border-danger bg-danger-soft"

// ─── Componente ──────────────────────────────────────────────────────────────

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
    (
        {
            label,
            error,
            hint,
            required,
            options,
            value,
            onChange,
            placeholder,
            emptyMessage = "Sin resultados",
            leftAddon,
            disabled = false,
            fullWidth = true,
            name,
            id,
        },
        ref,
    ) => {
        const reactId = useId()
        const inputId = id ?? (label ? `${label.toLowerCase().replace(/\s+/g, "-")}-${reactId}` : reactId)
        const listboxId = `${inputId}-listbox`
        const hasError = Boolean(error)

        const [open, setOpen] = useState(false)
        const [query, setQuery] = useState("")
        const [activeIndex, setActiveIndex] = useState(0)

        const containerRef = useRef<HTMLDivElement>(null)
        const listRef = useRef<HTMLUListElement>(null)

        const selected = useMemo(
            () => options.find((o) => o.value === value) ?? null,
            [options, value],
        )

        // Filtrado con RegExp sobre texto normalizado (sin tildes / case-insensitive).
        const filtered = useMemo(() => {
            const q = normalize(query)
            if (!q) return options
            const re = new RegExp(escapeRegex(q))
            return options.filter((o) => re.test(normalize(o.label)))
        }, [options, query])

        // Cierre al hacer click fuera.
        useEffect(() => {
            if (!open) return
            const onDocMouseDown = (e: MouseEvent) => {
                if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
            }
            document.addEventListener("mousedown", onDocMouseDown)
            return () => document.removeEventListener("mousedown", onDocMouseDown)
        }, [open])

        // Mantener la opción activa visible al navegar con teclado.
        useEffect(() => {
            if (!open) return
            const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
            el?.scrollIntoView({ block: "nearest" })
        }, [activeIndex, open])

        const openList = () => {
            if (disabled) return
            setOpen(true)
            setQuery("")
            setActiveIndex(Math.max(0, filtered.findIndex((o) => o.value === value)))
        }

        const select = (opt: ComboboxOption) => {
            if (opt.disabled) return
            onChange(opt.value)
            setOpen(false)
            setQuery("")
        }

        const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled) return
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    if (!open) return openList()
                    setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    if (!open) return openList()
                    setActiveIndex((i) => Math.max(0, i - 1))
                    break
                case "Enter":
                    if (open && filtered[activeIndex]) {
                        e.preventDefault()
                        select(filtered[activeIndex])
                    }
                    break
                case "Escape":
                    if (open) {
                        e.preventDefault()
                        setOpen(false)
                        setQuery("")
                    }
                    break
                case "Tab":
                    setOpen(false)
                    break
            }
        }

        // El texto del input: lo que escribe (abierto) o la etiqueta elegida (cerrado).
        const displayValue = open ? query : selected?.label ?? ""

        return (
            <div className={fullWidth ? "w-full" : "inline-block"} ref={containerRef}>
                {label && (
                    <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text">
                        {label}
                        {required && (
                            <span className="ml-1 text-danger" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {leftAddon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                            {leftAddon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        name={name}
                        type="text"
                        role="combobox"
                        autoComplete="off"
                        aria-expanded={open}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            open && filtered[activeIndex] ? `${inputId}-opt-${activeIndex}` : undefined
                        }
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        disabled={disabled}
                        placeholder={placeholder}
                        value={displayValue}
                        onFocus={openList}
                        onClick={openList}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setOpen(true)
                            setActiveIndex(0)
                        }}
                        onKeyDown={onKeyDown}
                        className={cn(
                            baseField,
                            hasError ? stateError : stateNormal,
                            leftAddon ? "pl-9" : "pl-3",
                        )}
                    />

                    {/* Chevron */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>

                    {open && (
                        <ul
                            ref={listRef}
                            id={listboxId}
                            role="listbox"
                            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg"
                        >
                            {filtered.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-text-muted">{emptyMessage}</li>
                            ) : (
                                filtered.map((opt, i) => {
                                    const isActive = i === activeIndex
                                    const isSelected = opt.value === value
                                    return (
                                        <li
                                            key={opt.value}
                                            id={`${inputId}-opt-${i}`}
                                            data-index={i}
                                            role="option"
                                            aria-selected={isSelected}
                                            aria-disabled={opt.disabled}
                                            // onMouseDown (no onClick): dispara antes del blur del input.
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                select(opt)
                                            }}
                                            onMouseEnter={() => setActiveIndex(i)}
                                            className={cn(
                                                "cursor-pointer px-3 py-2 text-sm",
                                                opt.disabled && "cursor-not-allowed text-text-muted opacity-60",
                                                isActive && !opt.disabled && "bg-surface-muted",
                                                isSelected && "font-medium text-primary",
                                            )}
                                        >
                                            {opt.label}
                                        </li>
                                    )
                                })
                            )}
                        </ul>
                    )}
                </div>

                {hasError && (
                    <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-danger-strong">
                        {error}
                    </p>
                )}
                {!hasError && hint && (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-text-muted">
                        {hint}
                    </p>
                )}
            </div>
        )
    },
)

Combobox.displayName = "Combobox"

export type { ComboboxProps, ComboboxOption }
