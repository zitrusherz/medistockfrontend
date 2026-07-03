

import { type ReactNode } from 'react';

interface AlertShellProps {
    title: string;
    subtitle?: string;
    /** Contenido del panel lateral de filtros (lo aporta cada vista). */
    filtros: ReactNode;
    /** Acciones a la derecha del encabezado: contador + orden. */
    toolbar?: ReactNode;
    /** Restablece los filtros de la vista concreta. */
    onClear?: () => void;
    /** Tabla (u otro contenido) de la vista concreta. */
    children: ReactNode;
}

export function AlertShell({ title, subtitle, filtros, toolbar, onClear, children }: AlertShellProps) {
    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="w-full shrink-0 lg:w-[270px]">
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                    <div className="flex items-center justify-between bg-primary px-4 py-3 text-surface">
                        <span className="font-display text-lg font-bold">Filtros y orden</span>
                        {onClear && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="rounded text-xs font-semibold text-accent transition-colors hover:text-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className="px-4 pb-2">{filtros}</div>
                </div>
            </aside>

            <section className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="font-display text-2xl font-bold leading-none text-primary">{title}</h2>
                        {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
                    </div>
                    {toolbar}
                </div>
                {children}
            </section>
        </div>
    );
}

/** Sección de filtro con título y separador inferior. Reutilizada por ambas vistas. */
export function FilterSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="border-b border-border py-4 last:border-0">
            <p className="mb-2.5 font-display text-[15px] font-bold text-primary">{title}</p>
            {children}
        </div>
    );
}

export type { AlertShellProps };
