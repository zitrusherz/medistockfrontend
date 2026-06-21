import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: ReactNode
    error?: string
    hint?: string
}

interface RadioGroupProps {
    label?: string
    error?: string
    hint?: string
    children: ReactNode
    /** Dirección del layout */
    direction?: "row" | "column"
}

// ─── RadioGroup ────────────────────────────────────────────────────────────────

export function RadioGroup({ label, error, hint, children, direction = "column" }: RadioGroupProps) {
    const groupId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined
    const hasError = Boolean(error)

    return (
        <fieldset
            aria-describedby={hasError ? `${groupId}-error` : hint ? `${groupId}-hint` : undefined}
            className="m-0 border-none p-0"
        >
            {label && <legend className="mb-2 text-sm font-medium text-text">{label}</legend>}

            <div className={cn("flex gap-3", direction === "column" ? "flex-col" : "flex-row flex-wrap")}>
                {children}
            </div>

            {hasError && (
                <p id={`${groupId}-error`} role="alert" className="mt-1.5 text-xs text-danger-strong">
                    {error}
                </p>
            )}
            {!hasError && hint && (
                <p id={`${groupId}-hint`} className="mt-1.5 text-xs text-text-muted">
                    {hint}
                </p>
            )}
        </fieldset>
    )
}

// ─── Radio ───────────────────────────────────────────────────────────────────

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ label, error, hint, disabled, className, id, ...rest }, ref) => {
        const inputId = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
        const hasError = Boolean(error)

        return (
            <div className="inline-flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                    <input
                        ref={ref}
                        type="radio"
                        id={inputId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        className={cn(
                            "h-4 w-4 cursor-pointer border transition-colors duration-150",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                            hasError ? "border-danger accent-danger" : "border-border accent-primary",
                            disabled && "cursor-not-allowed opacity-50",
                            className,
                        )}
                        {...rest}
                    />
                    {label && (
                        <label
                            htmlFor={inputId}
                            className={cn("text-sm", disabled ? "cursor-not-allowed text-text-muted" : "cursor-pointer text-text")}
                        >
                            {label}
                        </label>
                    )}
                </div>

                {/* ml-[1.625rem]: antes `ml-6.5`, que no existe en la escala de Tailwind. */}
                {hasError && (
                    <p role="alert" className="ml-[1.625rem] text-xs text-danger-strong">
                        {error}
                    </p>
                )}
                {!hasError && hint && <p className="ml-[1.625rem] text-xs text-text-muted">{hint}</p>}
            </div>
        )
    }
)

Radio.displayName = "Radio"

export type { RadioProps, RadioGroupProps }