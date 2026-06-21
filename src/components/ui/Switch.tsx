import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    label?: ReactNode
    /** Descripción bajo la etiqueta */
    description?: string
    error?: string
    /** Posición de la etiqueta */
    labelPlacement?: "left" | "right"
    size?: "sm" | "md" | "lg"
}

// ─── Tamaños ─────────────────────────────────────────────────────────────────
// `4.5`/`5.5` no existen en la escala de Tailwind; los tamaños lg usan valores
// arbitrarios para no romper (antes el thumb lg no aplicaba nada).

const trackSize = {
    sm: "h-4 w-7",
    md: "h-5 w-9",
    lg: "h-6 w-11",
}

const thumbSize = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-[1.125rem] w-[1.125rem]",
}

const thumbTranslate = {
    sm: "translate-x-3.5",
    md: "translate-x-[1.125rem]",
    lg: "translate-x-[1.375rem]",
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    (
        {
            label,
            description,
            error,
            labelPlacement = "right",
            size = "md",
            disabled,
            checked: controlledChecked,
            defaultChecked,
            onChange,
            className,
            id,
            ...rest
        },
        ref
    ) => {
        const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false)
        const isControlled = controlledChecked !== undefined
        const isChecked = isControlled ? controlledChecked : internalChecked

        const inputId =
            id ?? (typeof label === "string" ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)

        const hasError = Boolean(error)

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            if (!isControlled) setInternalChecked(e.target.checked)
            onChange?.(e)
        }

        const track = (
            <span
                aria-hidden="true"
                className={cn(
                    "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
                    trackSize[size],
                    isChecked ? (hasError ? "bg-danger" : "bg-primary") : "bg-ink/20",
                    disabled && "cursor-not-allowed opacity-50",
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block rounded-full bg-white shadow transition-transform duration-200",
                        thumbSize[size],
                        isChecked ? thumbTranslate[size] : "translate-x-0.5",
                    )}
                />
            </span>
        )

        const labelEl = label && (
            <span className="flex flex-col">
                <span className={cn("text-sm font-medium", disabled ? "text-text-muted" : "text-text")}>{label}</span>
                {description && <span className="text-xs text-text-muted">{description}</span>}
            </span>
        )

        return (
            <div className={cn("flex flex-col gap-1", className)}>
                <label
                    htmlFor={inputId}
                    className={cn(
                        "inline-flex items-center gap-3",
                        disabled ? "cursor-not-allowed" : "cursor-pointer",
                        labelPlacement === "left" ? "flex-row-reverse" : "flex-row",
                    )}
                >
                    {/* Input real oculto para integración con formularios */}
                    <input
                        ref={ref}
                        type="checkbox"
                        role="switch"
                        id={inputId}
                        checked={isChecked}
                        disabled={disabled}
                        onChange={handleChange}
                        aria-checked={isChecked}
                        aria-invalid={hasError}
                        className="sr-only"
                        {...rest}
                    />
                    {track}
                    {labelEl}
                </label>

                {hasError && (
                    <p role="alert" className="text-xs text-danger-strong">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Switch.displayName = "Switch"

export type { SwitchProps }