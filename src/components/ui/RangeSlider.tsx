import { type ReactNode } from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface RangeSliderProps {
    min: number
    max: number
    step?: number
    /** Tupla [bajo, alto] controlada por el padre. */
    value: [number, number]
    onChange: (value: [number, number]) => void
    /** Formatea cada extremo para mostrarlo sobre la barra. */
    format?: (v: number) => ReactNode
    label?: ReactNode
    className?: string
    disabled?: boolean
}



export function RangeSlider({
    min,
    max,
    step = 1,
    value,
    onChange,
    format = (v) => v,
    label,
    className,
    disabled = false,
}: RangeSliderProps) {
    // Evita división por cero cuando el dataset deja min === max.
    const safeMax = Math.max(max, min + 1)
    const [lo, hi] = value

    const pct = (v: number) => ((v - min) / (safeMax - min)) * 100
    const pctLo = Math.min(100, Math.max(0, pct(lo)))
    const pctHi = Math.min(100, Math.max(0, pct(hi)))

    return (
        <div className={cn("w-full", className)}>
            {label && <p className="mb-2 text-sm font-medium text-text">{label}</p>}

            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-primary">
                <span className="rounded bg-surface-muted px-2 py-0.5">{format(lo)}</span>
                <span className="text-text-muted">—</span>
                <span className="rounded bg-surface-muted px-2 py-0.5">{format(hi)}</span>
            </div>

            <div className="relative h-5">
                {/* Pista de fondo */}
                <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-border" />
                {/* Recorrido seleccionado */}
                <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
                />

                <input
                    type="range"
                    min={min}
                    max={safeMax}
                    step={step}
                    value={lo}
                    disabled={disabled}
                    aria-label="Valor mínimo"
                    onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
                    className="range-thumb pointer-events-none absolute top-0 w-full appearance-none bg-transparent focus-visible:outline-none"
                />
                <input
                    type="range"
                    min={min}
                    max={safeMax}
                    step={step}
                    value={hi}
                    disabled={disabled}
                    aria-label="Valor máximo"
                    onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
                    className="range-thumb pointer-events-none absolute top-0 w-full appearance-none bg-transparent focus-visible:outline-none"
                />
            </div>
        </div>
    )
}

export type { RangeSliderProps }
