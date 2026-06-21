import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    hint?: string
    required?: boolean
    /** Comportamiento de redimensionado */
    resize?: "none" | "vertical" | "horizontal" | "both"
    fullWidth?: boolean
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const resizeMap = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
}

const baseTextarea =
    "block w-full rounded-md border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed"

// ─── Componente ──────────────────────────────────────────────────────────────

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, required, resize = "vertical", fullWidth = true, className, id, rows = 4, ...rest }, ref) => {
        const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
        const hasError = Boolean(error)

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

                <textarea
                    ref={ref}
                    id={inputId}
                    rows={rows}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    className={cn(
                        baseTextarea,
                        hasError
                            ? "border-danger focus-visible:ring-danger focus-visible:border-danger bg-danger-soft"
                            : "border-border focus-visible:ring-ring focus-visible:border-primary",
                        resizeMap[resize],
                        className,
                    )}
                    {...rest}
                />

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

Textarea.displayName = "Textarea"

export type { TextareaProps }