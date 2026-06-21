import {
    forwardRef,
    useEffect,
    useRef,
    type InputHTMLAttributes,
    type ReactNode,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: ReactNode
    error?: string
    hint?: string
    /** Tri-estado: muestra guion en vez de check */
    indeterminate?: boolean
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, hint, indeterminate = false, disabled, className, id, ...rest }, ref) => {
        const innerRef = useRef<HTMLInputElement>(null)
        // Mezcla ref reenviado + ref interno
        const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? innerRef

        const inputId =
            id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

        const hasError = Boolean(error)

        // indeterminate se setea imperativamente (no existe como atributo HTML)
        useEffect(() => {
            if (resolvedRef.current) resolvedRef.current.indeterminate = indeterminate
        }, [indeterminate, resolvedRef])

        return (
            <div className="inline-flex flex-col gap-1">
                <div className="flex items-start gap-2.5">
                    <input
                        ref={resolvedRef}
                        type="checkbox"
                        id={inputId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
                        }
                        className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border transition-colors duration-150",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                            hasError ? "border-danger accent-danger" : "border-border accent-primary",
                            disabled && "cursor-not-allowed opacity-50",
                            className, // ← el consumidor gana
                        )}
                        {...rest}
                    />

                    {label && (
                        <label
                            htmlFor={inputId}
                            className={cn(
                                "text-sm",
                                disabled ? "cursor-not-allowed text-text-muted" : "cursor-pointer text-text",
                            )}
                        >
                            {label}
                        </label>
                    )}
                </div>

                {/* ml-[1.625rem] = ancho del check (1rem) + gap (0.625rem). Antes era
                    `ml-6.5`, que no existe en la escala de Tailwind y no aplicaba nada. */}
                {hasError && (
                    <p id={`${inputId}-error`} role="alert" className="ml-[1.625rem] text-xs text-danger-strong">
                        {error}
                    </p>
                )}
                {!hasError && hint && (
                    <p id={`${inputId}-hint`} className="ml-[1.625rem] text-xs text-text-muted">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Checkbox.displayName = "Checkbox"

export type { CheckboxProps }