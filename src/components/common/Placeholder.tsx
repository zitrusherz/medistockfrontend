interface PlaceholderProps {
    title: string
    /** Tarea del plan que reemplazará este stub, ej "T2.3" */
    tarea?: string
}

/**
 * Stub temporal de página. Cada page la re-exporta con su título.
 * Se irá reemplazando hito a hito (H2–H4). No es UI final.
 */
export function Placeholder({ title, tarea }: PlaceholderProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-400">
                Página en construcción{tarea ? ` · ${tarea}` : ""}
            </p>
        </div>
    )
}