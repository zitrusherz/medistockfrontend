import {
    forwardRef,
    type ButtonHTMLAttributes,
    type ElementType,
    type ReactNode,
    type JSX,
    type ForwardedRef,
} from "react"
import { cn } from "@/utils/cn.ts"



const variants = {
    primary:
        "bg-primary text-white hover:bg-primary-strong active:bg-primary-strong focus-visible:ring-ring",
    secondary:
        "bg-surface text-text border border-border hover:bg-surface-muted active:bg-surface-muted focus-visible:ring-ring",
    danger:
        "bg-danger text-white hover:bg-danger-strong active:bg-danger-strong focus-visible:ring-danger",
    ghost:
        "bg-transparent text-text-muted hover:bg-surface-muted hover:text-text active:bg-surface-muted focus-visible:ring-ring",
    outline:
        "bg-transparent text-primary border border-primary hover:bg-primary/5 active:bg-primary/10 focus-visible:ring-ring",
    success:
        "bg-success text-white hover:bg-success-strong active:bg-success-strong focus-visible:ring-success",
} as const

const sizes = {
    xs: "h-7 px-2.5 text-xs gap-1.5",
    sm: "h-8 px-3 text-sm gap-2",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-base gap-2.5",
    xl: "h-12 px-6 text-base gap-3",
} as const

type Variant = keyof typeof variants
type Size = keyof typeof sizes

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ButtonOwnProps<E extends ElementType = "button"> {
    /** Estilo visual */
    variant?: Variant
    /** Tamaño */
    size?: Size
    /** Muestra spinner y deshabilita */
    loading?: boolean
    /** Contenido antes del texto (ícono) */
    leftSlot?: ReactNode
    /** Contenido después del texto (ícono) */
    rightSlot?: ReactNode
    /** Renderiza otro elemento (ej. 'a', Link de router) */
    as?: E
    /** Ancho completo */
    fullWidth?: boolean
    children?: ReactNode
}

type ButtonProps<E extends ElementType = "button"> = ButtonOwnProps<E> &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps<E>>

// ─── Spinner (inline) ────────────────────────────────────────────────────────

function ButtonSpinner() {
    return (
        <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    )
}

// ─── Componente ──────────────────────────────────────────────────────────────

function ButtonInner<E extends ElementType = "button">(
    {
        as,
        variant = "primary",
        size = "md",
        loading = false,
        disabled,
        leftSlot,
        rightSlot,
        fullWidth = false,
        className,
        children,
        ...rest
    }: ButtonProps<E>,

    ref: ForwardedRef<HTMLElement>
) {
    const Tag = (as ?? "button") as ElementType
    const isDisabled = disabled ?? loading

    const base =
        "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"

    return (
        <Tag
            ref={ref}
            disabled={isDisabled}
            aria-busy={loading}
            className={cn(
                base,
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className, // ← el consumidor gana
            )}
            {...rest}
        >
            {loading ? <ButtonSpinner /> : leftSlot}
            {children && <span>{children}</span>}
            {!loading && rightSlot}
        </Tag>
    )
}

export const Button = forwardRef(ButtonInner) as <E extends ElementType = "button">(
    props: ButtonProps<E> & { ref?: ForwardedRef<HTMLElement> }
) => JSX.Element

export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize }