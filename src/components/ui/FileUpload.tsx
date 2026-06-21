import {
    forwardRef,
    useRef,
    useState,
    type DragEvent,
    type InputHTMLAttributes,
} from "react"
import { cn } from "@/utils/cn.ts"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type MaybePromise<T> = T | Promise<T>

/** Resultado de validar un archivo. El componente no decide qué es válido. */
export interface FileValidationResult {
    ok: boolean
    /** Mensaje a mostrar cuando ok === false. */
    error?: string
}

interface FileUploadProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
    label?: string
    error?: string
    hint?: string
    /** Callback con los archivos aceptados (los que pasaron `validate`). */
    onFilesChange?: (files: File[]) => void
    /** Tamaño máximo en bytes, solo para mostrar en la UI. La validación real
     *  la decide quien pasa `validate`. */
    maxSize?: number
    /** Muestra la lista de archivos seleccionados debajo */
    showFileList?: boolean
    /**
     * Valida cada archivo. Si devuelve { ok: false }, el archivo se descarta y
     * se muestra su `error`. Sin esta prop, todos los archivos se aceptan.
     * El componente es agnóstico: no sabe si valida imágenes, PDFs u otra cosa.
     */
    validate?: (file: File) => MaybePromise<FileValidationResult>
    /**
     * Devuelve una URL de previsualización (data URL u object URL) para mostrar
     * como miniatura. Sin esta prop, se muestra el ícono genérico de archivo.
     */
    getPreview?: (file: File) => MaybePromise<string | undefined>
}

/** Item interno: el archivo aceptado + su miniatura (si `getPreview` la dio). */
interface UploadItem {
    file: File
    preview?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Libera object URLs (blob:) para evitar fugas. Los data URLs no requieren esto. */
function revokeIfBlob(url?: string) {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url)
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    (
        {
            label,
            error,
            hint,
            onFilesChange,
            maxSize,
            showFileList = true,
            validate,
            getPreview,
            accept,
            multiple,
            disabled,
            className,
            id,
            ...rest
        },
        ref
    ) => {
        const inputRef = useRef<HTMLInputElement>(null)
        const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? inputRef

        const [dragging, setDragging] = useState(false)
        const [items, setItems] = useState<UploadItem[]>([])
        const [validationError, setValidationError] = useState<string | null>(null)
        const [processing, setProcessing] = useState(false)

        const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : "file-upload")

        // El error puede venir del padre (prop) o de la validación pasada por props.
        const shownError = error ?? validationError ?? undefined
        const hasError = Boolean(shownError)

        async function handleFiles(incoming: FileList | null) {
            if (!incoming || incoming.length === 0) return
            const list = Array.from(incoming)

            // Sin validación ni preview: ruta simple y síncrona (uploader puro).
            if (!validate && !getPreview) {
                setItems(list.map((file) => ({ file })))
                setValidationError(null)
                onFilesChange?.(list)
                return
            }

            setProcessing(true)
            setValidationError(null)

            // Limpia miniaturas anteriores por si eran object URLs.
            items.forEach((it) => revokeIfBlob(it.preview))

            const accepted: UploadItem[] = []
            const errors: string[] = []

            for (const file of list) {
                if (validate) {
                    const result = await validate(file)
                    if (!result.ok) {
                        errors.push(
                            result.error
                                ? `${file.name}: ${result.error}`
                                : `${file.name}: archivo no válido.`
                        )
                        continue
                    }
                }

                let preview: string | undefined
                if (getPreview) {
                    try {
                        preview = await getPreview(file)
                    } catch {
                        // La miniatura es opcional; el archivo ya pasó la validación.
                    }
                }

                accepted.push({ file, preview })
            }

            setItems(accepted)
            onFilesChange?.(accepted.map((i) => i.file))
            setValidationError(errors.length ? errors.join(" · ") : null)
            setProcessing(false)
        }

        function handleDragOver(e: DragEvent<HTMLDivElement>) {
            e.preventDefault()
            if (!disabled) setDragging(true)
        }

        function handleDragLeave() {
            setDragging(false)
        }

        function handleDrop(e: DragEvent<HTMLDivElement>) {
            e.preventDefault()
            setDragging(false)
            if (!disabled && !processing) void handleFiles(e.dataTransfer.files)
        }

        function removeFile(index: number) {
            revokeIfBlob(items[index]?.preview)
            const next = items.filter((_, i) => i !== index)
            setItems(next)
            onFilesChange?.(next.map((i) => i.file))
        }

        const interactionsBlocked = Boolean(disabled) || processing

        return (
            <div className={cn("w-full", className)}>
                {label && (
                    <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text">
                        {label}
                    </label>
                )}

                {/* Drop zone */}
                <div
                    role="button"
                    tabIndex={interactionsBlocked ? -1 : 0}
                    aria-disabled={interactionsBlocked}
                    aria-busy={processing}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !interactionsBlocked && resolvedRef.current?.click()}
                    onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !interactionsBlocked) {
                            resolvedRef.current?.click()
                        }
                    }}
                    className={cn(
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors duration-150",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        dragging
                            ? "border-primary bg-primary/5"
                            : hasError
                                ? "border-danger bg-danger-soft"
                                : "border-border bg-surface-muted hover:border-text-muted/60 hover:bg-surface",
                        interactionsBlocked && "cursor-not-allowed opacity-50",
                    )}
                >
                    {/* Upload icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn("h-8 w-8", dragging ? "text-primary" : "text-text-muted")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                    </svg>

                    <div>
                        <p className="text-sm text-text">
                            <span className="font-medium text-primary">Haz clic</span> o arrastra archivos aquí
                        </p>
                        {accept && (
                            <p className="mt-0.5 text-xs text-text-muted">{accept.split(",").join(", ")}</p>
                        )}
                        {maxSize && <p className="text-xs text-text-muted">Máx. {formatBytes(maxSize)}</p>}
                    </div>
                </div>

                {/* Estado de procesamiento (validación / preview en curso) */}
                {processing && <p className="mt-1.5 text-xs text-text-muted">Procesando…</p>}

                {/* Hidden input */}
                <input
                    ref={resolvedRef}
                    id={inputId}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    className="sr-only"
                    onChange={(e) => void handleFiles(e.target.files)}
                    {...rest}
                />

                {/* Error / hint */}
                {hasError && (
                    <p role="alert" className="mt-1.5 text-xs text-danger-strong">
                        {shownError}
                    </p>
                )}
                {!hasError && hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}

                {/* File list */}
                {showFileList && items.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                        {items.map(({ file, preview }, i) => (
                            <li
                                key={`${file.name}-${i}`}
                                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt=""
                                            className="h-9 w-9 shrink-0 rounded border border-border object-cover"
                                        />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 shrink-0 text-text-muted"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    )}
                                    <span className="truncate text-sm text-text">{file.name}</span>
                                    <span className="shrink-0 text-xs text-text-muted">{formatBytes(file.size)}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label={`Eliminar ${file.name}`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    }
)

FileUpload.displayName = "FileUpload"

export type { FileUploadProps }