import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SelectOption {
    value: string | number
    label: string
    disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    hint?: string
    required?: boolean
    /** Opciones (alternativa a children) */
    options?: SelectOption[]
    /** Placeholder como primera opción deshabilitada */
    placeholder?: string
    /** Ícono/elemento a la izquierda dentro del select */
    leftAddon?: ReactNode
    fullWidth?: boolean
    children?: ReactNode
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, required, options, placeholder, leftAddon, fullWidth = true, className, id, children, ...rest }, ref) => {
        const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
        const hasError = Boolean(error)

        const baseSelect =
            "block w-full appearance-none rounded-md border bg-surface text-sm text-text transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed pr-9 py-2"

        const stateClass = hasError
            ? "border-danger focus-visible:ring-danger bg-danger-soft"
            : "border-border focus-visible:ring-ring focus-visible:border-primary"

        const paddingLeft = leftAddon ? "pl-9" : "pl-3"

        return (
            <div className={fullWidth ? "w-full" : "inline-block"}>
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

                    <select
                        ref={ref}
                        id={inputId}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        className={cn(baseSelect, stateClass, paddingLeft, className)}
                        {...rest}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options
                            ? options.map((opt) => (
                                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {opt.label}
                                </option>
                            ))
                            : children}
                    </select>

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
    }
)

Select.displayName = "Select"

export type { SelectProps, SelectOption }