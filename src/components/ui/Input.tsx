import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Etiqueta sobre el input */
    label?: string
    /** Mensaje de error bajo el input (activa estilo de error) */
    error?: string
    /** Texto de ayuda bajo el input (si no hay error) */
    hint?: string
    /** Ícono/elemento dentro del input, a la izquierda */
    leftAddon?: ReactNode
    /** Ícono/elemento dentro del input, a la derecha */
    rightAddon?: ReactNode
    /** Asterisco de requerido en la etiqueta */
    required?: boolean
    /** Ancho completo (default true) */
    fullWidth?: boolean
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const baseInput =
    "block w-full rounded-md border bg-surface text-sm text-text placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed"

const stateStyles = {
    normal: "border-border focus-visible:ring-ring focus-visible:border-primary",
    error: "border-danger focus-visible:ring-danger focus-visible:border-danger bg-danger-soft",
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { label, error, hint, leftAddon, rightAddon, required, fullWidth = true, className, id, ...rest },
        ref
    ) => {
        const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
        const hasError = Boolean(error)

        const paddingLeft = leftAddon ? "pl-9" : "pl-3"
        const paddingRight = rightAddon ? "pr-9" : "pr-3"

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

                    <input
                        ref={ref}
                        id={inputId}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        className={cn(
                            baseInput,
                            hasError ? stateStyles.error : stateStyles.normal,
                            "py-2",
                            paddingLeft,
                            paddingRight,
                            className,
                        )}
                        {...rest}
                    />

                    {rightAddon && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                            {rightAddon}
                        </div>
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
    }
)

Input.displayName = "Input"

export type { InputProps }