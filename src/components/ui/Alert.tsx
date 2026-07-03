import {
    forwardRef,
    useState,
    type HTMLAttributes,
    type ReactNode,
    type JSX,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type AlertVariant = "info" | "success" | "warning" | "error"

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    variant?: AlertVariant
    title?: ReactNode
    children?: ReactNode
    /** Muestra botón X para descartar */
    dismissible?: boolean
    onDismiss?: () => void
    /** Ícono propio — reemplaza al por defecto */
    icon?: ReactNode
}



const styles: Record<AlertVariant, { container: string; icon: string }> = {
    info: { container: "bg-info-soft border-info/30 text-info-strong", icon: "text-info" },
    success: { container: "bg-success-soft border-success/30 text-success-strong", icon: "text-success" },
    warning: { container: "bg-warning-soft border-warning/30 text-warning-strong", icon: "text-warning" },
    error: { container: "bg-danger-soft border-danger/30 text-danger-strong", icon: "text-danger" },
}

// ─── Íconos por defecto ────────────────────────────────────────────────────────

const DefaultIcons: Record<AlertVariant, JSX.Element> = {
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
    ),
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
    (
        {
            variant = "info",
            title,
            children,
            dismissible = false,
            onDismiss,
            icon,
            className,
            ...rest
        },
        ref
    ) => {
        const [visible, setVisible] = useState(true)

        if (!visible) return null

        const s = styles[variant]

        function dismiss() {
            setVisible(false)
            onDismiss?.()
        }

        return (
            <div
                ref={ref}
                role="alert"
                className={cn("flex gap-3 rounded-md border px-4 py-3", s.container, className)}
                {...rest}
            >
                {/* Ícono */}
                <div className={cn("mt-0.5 shrink-0", s.icon)}>{icon ?? DefaultIcons[variant]}</div>

                {/* Contenido */}
                <div className="min-w-0 flex-1">
                    {title && <p className="text-sm font-semibold">{title}</p>}
                    {children && <div className="mt-0.5 text-sm opacity-90">{children}</div>}
                </div>

                {/* Descartar */}
                {dismissible && (
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label="Cerrar alerta"
                        className="ml-auto shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        )
    }
)

Alert.displayName = "Alert"

export type { AlertProps, AlertVariant }